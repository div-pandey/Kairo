import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/constants';
import { extractPdfPageCountFromBuffer, extractOfficePageCount } from '@/lib/pageCounter';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // ── Rate Limiting (40 page-count requests / min per IP) ────────────────
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`page-count:${clientIp}`, 40, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Page inspection rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds maximum upload size of ${MAX_FILE_SIZE_MB} MB.` },
        { status: 400 }
      );
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // 1. Single images are always 1 page
    if (fileType.startsWith('image/')) {
      return NextResponse.json({ pageCount: 1, source: 'auto' });
    }

    // Read buffer for document inspection
    const buffer = await file.arrayBuffer();

    // 2. PDF parsing using pdf-lib with binary fallback
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // Try pdf-lib first
      try {
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true, updateMetadata: false });
        const count = pdfDoc.getPageCount();
        const safeCount = Math.min(Math.max(1, count), 2500);

        return NextResponse.json({
          pageCount: safeCount,
          source: 'auto',
        });
      } catch (pdfErr) {
        console.warn('pdf-lib failed, trying binary stream scanner fallback:', pdfErr);
      }

      // Fallback: Binary page tree scanner (works even on malformed/scanned PDFs)
      const binaryCount = extractPdfPageCountFromBuffer(buffer);
      if (binaryCount && binaryCount > 0) {
        return NextResponse.json({
          pageCount: binaryCount,
          source: 'auto',
        });
      }

      return NextResponse.json({
        pageCount: null,
        error: 'Could not read PDF structure automatically. Please enter page count manually.',
        source: 'manual',
      });
    }

    // 3. PPTX / PPT / DOCX / DOC inspection
    if (
      fileName.endsWith('.pptx') ||
      fileName.endsWith('.ppt') ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      const officeCount = extractOfficePageCount(buffer, fileName);
      if (officeCount && officeCount > 0) {
        return NextResponse.json({
          pageCount: officeCount,
          source: 'auto',
        });
      }
    }

    // 4. Default prompt if auto-detection could not determine count
    return NextResponse.json({
      pageCount: null,
      error: 'Please enter total pages for this document.',
      source: 'manual',
    });
  } catch (err: any) {
    console.error('Page count detection error:', err);
    return NextResponse.json(
      { error: 'Failed to inspect file structure' },
      { status: 500 }
    );
  }
}
