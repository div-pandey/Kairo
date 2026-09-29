// IndexedDB-based real-time cache for in-progress print orders
// Allows students on mobile or PC to reload or navigate without losing uploaded files or settings

import { UploadedFile } from '@/types';

const DB_NAME = 'kairo_order_cache_db';
const DB_VERSION = 1;
const STORE_NAME = 'order_draft';
const DRAFT_KEY = 'active_draft';
const MAX_DRAFT_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours

export interface StoredDraft {
  files: UploadedFile[];
  step: 'upload' | 'configure' | 'confirm';
  notes: string;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Persists files (as native binary Blobs/Files) + configuration in the browser's IndexedDB.
 */
export async function saveOrderDraft(
  files: UploadedFile[],
  step: 'upload' | 'configure' | 'confirm',
  notes: string
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // If files array is empty, remove the draft
    if (files.length === 0) {
      store.delete(DRAFT_KEY);
      return;
    }

    const draft: StoredDraft = {
      files,
      step,
      notes,
      updatedAt: Date.now(),
    };

    store.put(draft, DRAFT_KEY);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[Kairo Cache] Failed to save order draft to IndexedDB:', err);
  }
}

/**
 * Loads the active draft if one exists and is within the expiration window.
 */
export async function loadOrderDraft(): Promise<StoredDraft | null> {
  if (typeof window === 'undefined') return null;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(DRAFT_KEY);

    const draft = await new Promise<StoredDraft | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!draft || !Array.isArray(draft.files) || draft.files.length === 0) {
      return null;
    }

    // Expiration check
    if (Date.now() - draft.updatedAt > MAX_DRAFT_AGE_MS) {
      await clearOrderDraft();
      return null;
    }

    // Ensure the `file` object is a valid File / Blob instance
    const restoredFiles: UploadedFile[] = draft.files.map((item) => {
      const raw: any = item.file;
      let fileObj: File = raw;
      // In case structured clone deserialized it as a generic Blob
      if (raw && !(raw instanceof File) && raw instanceof Blob) {
        fileObj = new File([raw], item.name, {
          type: item.type,
          lastModified: Date.now(),
        });
      }

      return {
        ...item,
        file: fileObj,
        pageCountLoading: false, // Do not leave stuck in counting state
      };
    });

    return {
      ...draft,
      files: restoredFiles,
    };
  } catch (err) {
    console.warn('[Kairo Cache] Failed to load order draft from IndexedDB:', err);
    return null;
  }
}

/**
 * Purges the stored order draft (e.g. after successful order submission or user clearing).
 */
export async function clearOrderDraft(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(DRAFT_KEY);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[Kairo Cache] Failed to clear order draft from IndexedDB:', err);
  }
}
