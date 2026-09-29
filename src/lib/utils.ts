import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateLocalId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export const SUPPORTED_FILE_TYPES: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
};

export const SUPPORTED_EXTENSIONS = Object.values(SUPPORTED_FILE_TYPES).flat();

export function isFileSupported(file: File): boolean {
  const ext = getFileExtension(file.name);
  return SUPPORTED_EXTENSIONS.includes(ext) || Object.keys(SUPPORTED_FILE_TYPES).includes(file.type);
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function calculateItemTotal(
  pageCount: number,
  copies: number,
  pricePerPage: number
): number {
  return pageCount * copies * pricePerPage;
}

export function parsePageRange(
  rangeStr: string,
  maxPages?: number
): { valid: boolean; pages: number[]; count: number; error?: string } {
  const trimmed = rangeStr.trim();
  if (!trimmed || trimmed.toLowerCase() === 'all') {
    return { valid: true, pages: [], count: maxPages || 1 };
  }

  const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
  const pageSet = new Set<number>();

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        return { valid: false, pages: [], count: 0, error: `Invalid range: "${part}"` };
      }
      if (maxPages && end > maxPages) {
        return { valid: false, pages: [], count: 0, error: `Page ${end} exceeds document limit of ${maxPages} pages` };
      }
      for (let i = start; i <= end; i++) {
        pageSet.add(i);
      }
    } else {
      const single = parseInt(part, 10);
      if (isNaN(single) || single < 1) {
        return { valid: false, pages: [], count: 0, error: `Invalid page: "${part}"` };
      }
      if (maxPages && single > maxPages) {
        return { valid: false, pages: [], count: 0, error: `Page ${single} exceeds document limit of ${maxPages} pages` };
      }
      pageSet.add(single);
    }
  }

  const pages = Array.from(pageSet).sort((a, b) => a - b);
  if (pages.length === 0) {
    return { valid: false, pages: [], count: 0, error: 'Enter at least one page number' };
  }

  return { valid: true, pages, count: pages.length };
}
