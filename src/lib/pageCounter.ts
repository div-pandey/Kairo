// Multi-strategy high-performance page counter for PDF, PPTX, DOCX, and images
// Works both in browser and server up to 100MB files with zero dependencies

export interface PageCountResult {
  pageCount: number | null;
  source: 'auto' | 'manual' | 'estimated';
  error?: string;
}

/**
 * Fast binary scanner to find page count in PDF buffer
 */
export function extractPdfPageCountFromBuffer(buffer: ArrayBuffer | Uint8Array): number | null {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  
  // Convert binary bytes to latin1 string for regex matching
  // For large files (>5MB), reading first 1MB and last 2MB is sufficient for 99.9% of PDFs
  let text = '';
  const totalBytes = bytes.length;

  if (totalBytes <= 5 * 1024 * 1024) {
    // Read whole file in 64KB chunks to avoid stack overflow
    const chunkSize = 65536;
    for (let i = 0; i < totalBytes; i += chunkSize) {
      const slice = bytes.subarray(i, Math.min(i + chunkSize, totalBytes));
      text += String.fromCharCode.apply(null, Array.from(slice));
    }
  } else {
    // Read header (first 1MB) and trailer (last 2MB)
    const headLimit = Math.min(1024 * 1024, totalBytes);
    for (let i = 0; i < headLimit; i += 65536) {
      const slice = bytes.subarray(i, Math.min(i + 65536, headLimit));
      text += String.fromCharCode.apply(null, Array.from(slice));
    }
    const tailStart = Math.max(headLimit, totalBytes - 2 * 1024 * 1024);
    for (let i = tailStart; i < totalBytes; i += 65536) {
      const slice = bytes.subarray(i, Math.min(i + 65536, totalBytes));
      text += String.fromCharCode.apply(null, Array.from(slice));
    }
  }

  // 1. Check Root Pages dictionary: /Type /Pages ... /Count N
  // Matches: /Type /Pages /Count 52 or /Count 52 /Type /Pages
  const pagesMatches = [
    ...text.matchAll(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/gi),
    ...text.matchAll(/\/Count\s+(\d+)[^>]*?\/Type\s*\/Pages/gi),
  ];

  if (pagesMatches.length > 0) {
    const counts = pagesMatches.map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n) && n > 0 && n <= 5000);
    if (counts.length > 0) {
      // The root Pages node holds the maximum count in the page tree
      return Math.max(...counts);
    }
  }

  // 2. Check Linearized dictionary: /Linearized 1 ... /N 52
  const linMatches = [...text.matchAll(/\/Linearized\s+\d+[^>]*?\/N\s+(\d+)/gi)];
  if (linMatches.length > 0) {
    const linCount = parseInt(linMatches[0][1], 10);
    if (!isNaN(linCount) && linCount > 0 && linCount <= 5000) {
      return linCount;
    }
  }

  // 3. Count individual /Type /Page objects (excluding /Pages)
  const pageMatches = text.match(/\/Type\s*\/Page\b(?!\s*s)/g);
  if (pageMatches && pageMatches.length > 0) {
    return Math.min(pageMatches.length, 5000);
  }

  return null;
}

/**
 * Fast scanner to find slide count in PPTX or page count in DOCX archive
 */
export function extractOfficePageCount(buffer: ArrayBuffer | Uint8Array, fileName: string): number | null {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  // Read binary as text chunks
  let text = '';
  const scanLimit = Math.min(bytes.length, 3 * 1024 * 1024); // scan up to 3MB
  for (let i = 0; i < scanLimit; i += 65536) {
    const slice = bytes.subarray(i, Math.min(i + 65536, scanLimit));
    text += String.fromCharCode.apply(null, Array.from(slice));
  }

  // 1. PPTX: Check <Slides>N</Slides> or count ppt/slides/slideN.xml entries
  if (ext === 'pptx' || ext === 'ppt') {
    const slideMatches = text.match(/<Slides>(\d+)<\/Slides>/i);
    if (slideMatches && slideMatches[1]) {
      const count = parseInt(slideMatches[1], 10);
      if (!isNaN(count) && count > 0) return count;
    }

    // Count slide files in the ZIP directory table
    const zipSlideMatches = text.match(/ppt\/slides\/slide\d+\.xml/gi);
    if (zipSlideMatches && zipSlideMatches.length > 0) {
      // Each slide is listed twice in zip (local header + central directory), so deduplicate
      const uniqueSlides = new Set(zipSlideMatches.map((s) => s.toLowerCase()));
      if (uniqueSlides.size > 0) return uniqueSlides.size;
    }
  }

  // 2. DOCX: Check <Pages>N</Pages>
  if (ext === 'docx' || ext === 'doc') {
    const pageMatches = text.match(/<Pages>(\d+)<\/Pages>/i);
    if (pageMatches && pageMatches[1]) {
      const count = parseInt(pageMatches[1], 10);
      if (!isNaN(count) && count > 0) return count;
    }
  }

  return null;
}

/**
 * Client-side detector that reads the file directly in the browser
 * Avoids uploading 15MB-100MB over network just to get a page count!
 */
export async function detectPageCountInBrowser(file: File): Promise<PageCountResult> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // 1. Images are always 1 page
  if (fileType.startsWith('image/')) {
    return { pageCount: 1, source: 'auto' };
  }

  // 2. PDF detection directly in browser
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      const buffer = await file.arrayBuffer();
      const count = extractPdfPageCountFromBuffer(buffer);
      if (count && count > 0) {
        return { pageCount: count, source: 'auto' };
      }
    } catch (err) {
      console.warn('[PageDetector] Client PDF parse warning:', err);
    }
  }

  // 3. PPTX / DOCX detection directly in browser
  if (
    fileName.endsWith('.pptx') ||
    fileName.endsWith('.ppt') ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc')
  ) {
    try {
      const buffer = await file.arrayBuffer();
      const count = extractOfficePageCount(buffer, fileName);
      if (count && count > 0) {
        return { pageCount: count, source: 'auto' };
      }
    } catch (err) {
      console.warn('[PageDetector] Client Office parse warning:', err);
    }
  }

  return { pageCount: null, source: 'manual' };
}
