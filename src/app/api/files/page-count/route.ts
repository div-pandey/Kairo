import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/constants';

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

    // 2. PDF parsing using pdf-lib
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();

        // Enforce safety limit
        const safeCount = Math.min(Math.max(1, count), 2000);

        return NextResponse.json({
          pageCount: safeCount,
          source: 'auto',
        });
      } catch (pdfErr) {
        console.warn('PDF parsing notice:', pdfErr);
        return NextResponse.json({
          pageCount: null,
          error: 'Could not read PDF structure automatically. Please enter page count manually.',
          source: 'manual',
        });
      }
    }

    // 3. For office documents, prompt manual page count entry
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
