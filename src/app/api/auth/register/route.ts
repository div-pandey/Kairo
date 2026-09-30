import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizeText, sanitizeIdentifier, sanitizeEmail } from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Valid image signatures (magic bytes)
const IMAGE_MAGIC = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
};

function detectImageType(buffer: ArrayBuffer): 'jpeg' | 'png' | null {
  const bytes = new Uint8Array(buffer.slice(0, 8));

  const isJpeg = IMAGE_MAGIC.jpeg.every((b, i) => bytes[i] === b);
  if (isJpeg) return 'jpeg';

  const isPng = IMAGE_MAGIC.png.every((b, i) => bytes[i] === b);
  if (isPng) return 'png';

  return null;
}

/**
 * Verify student ID card using Google Gemini Vision (Free Tier).
 */
async function verifyKccIdWithGemini(
  imageBuffer: ArrayBuffer,
  mimeType: string,
  studentName?: string
): Promise<{ isValid: boolean; reason: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('replace-with')) {
    console.warn(
      '[Gemini Vision] GEMINI_API_KEY is not configured in .env.local. AI verification bypassed for local development.'
    );
    return { isValid: true, reason: 'AI verification skipped (GEMINI_API_KEY not configured)' };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    const base64Data = Buffer.from(imageBuffer).toString('base64');
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const prompt = `You are an automated student identity card verification assistant for KCC Group of Institutions (KCC Institute of Technology and Management / KCC Institute of Legal and Higher Education, Knowledge Park III, Greater Noida - affiliated with AKTU / GGSIPU).

Carefully examine this uploaded document/photo.

Verification Rules:
1. Is this image an authentic student identity card, temporary ID, or admission document belonging to KCC (KCC ITM, KCC ILHE, KCC Group, Greater Noida, AKTU, or IPU / GGSIPU)?
2. Check if it contains college student ID indicators: institution name/logo, student roll or enrollment number, student name${studentName ? ` (applicant says: "${studentName}")` : ''}, student photo, or branch/course.
3. REJECT any image that is clearly NOT a college ID card (e.g., random selfies, food, landscapes, animals, memes, receipts, screenshots of chats, blank documents, or unreadable blur).
4. If it looks like a legitimate KCC student ID card, approve it.

Respond ONLY with valid JSON in this exact structure with no extra text or markdown wrappers:
{"isValid": true, "reason": "brief 1-sentence explanation"}`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim();

    // Clean JSON markdown formatting if present
    const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      isValid: Boolean(parsed.isValid),
      reason: parsed.reason || (parsed.isValid ? 'Authentic KCC student ID verified' : 'Card could not be recognized as a valid KCC student ID'),
    };
  } catch (err: any) {
    console.error('[Gemini Vision] Verification exception:', err);
    // If Gemini fails (rate limit, network error), do NOT silently approve.
    // Return failure so the student gets a clear error and can retry.
    // Exception: if API key is simply not configured (dev environment), pass through.
    const isDevBypass = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('replace-with');
    if (isDevBypass) {
      return { isValid: true, reason: 'AI verification skipped (dev mode — GEMINI_API_KEY not set)' };
    }
    return {
      isValid: false,
      reason: 'ID verification service is temporarily unavailable. Please try again in a few moments.',
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── 0. Rate Limiting Protection (5 attempts / 10 mins per IP) ───────────
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`register:${clientIp}`, 5, 10 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const formData = await req.formData();

    // ── 1. Input Sanitization & Normalization ───────────────────────────────
    const fullName = sanitizeText(formData.get('fullName'), 80);
    const rawMobile = formData.get('mobileNumber') || formData.get('phone');
    const mobileDigits = String(rawMobile || '').replace(/\D/g, '').slice(-10);
    const kccId = sanitizeIdentifier(formData.get('kccId'), 30);
    const className = sanitizeText(formData.get('className'), 100);
    const year = sanitizeText(formData.get('year'), 25);
    const section = sanitizeIdentifier(formData.get('section'), 10);
    const classroomNumber = sanitizeIdentifier(
      (formData.get('classroomNumber') as string) || (formData.get('roomNumber') as string),
      40
    );
    const rawEmail = formData.get('email');
    const cleanEmail = sanitizeEmail(rawEmail);
    const password = String(formData.get('password') || '');
    const idCard = formData.get('idCard') as File | null;

    // ── 2. Basic field validation ──────────────────────────────────────────
    if (!fullName || !rawMobile || !kccId || !className || !year || !section || !classroomNumber) {
      return NextResponse.json(
        { error: 'Please fill in all required fields, including mobile number and classroom number.' },
        { status: 400 }
      );
    }

    if (mobileDigits.length !== 10) {
      return NextResponse.json(
        { error: 'The mobile number is invalid.' },
        { status: 400 }
      );
    }

    if (kccId.length !== 13 || !/^\d{13}$/.test(kccId)) {
      return NextResponse.json(
        { error: 'The roll number is incorrect. If it is not wrong, contact the developer.' },
        { status: 400 }
      );
    }

    if (!cleanEmail) {
      return NextResponse.json(
        { error: 'Please enter a valid, secure email address.' },
        { status: 400 }
      );
    }

    // Password complexity check
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (password.length > 72) {
      return NextResponse.json(
        { error: 'Password cannot exceed 72 characters.' },
        { status: 400 }
      );
    }

    // ── 3. ID Card file validation ─────────────────────────────────────────
    if (!idCard) {
      return NextResponse.json(
        { error: 'KCC Student ID card photo is required for verification.' },
        { status: 400 }
      );
    }

    // Check MIME type
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimes.includes(idCard.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'ID card photo must be a JPG or PNG image file.' },
        { status: 400 }
      );
    }

    // Check file size bounds (15 KB min, 10 MB max)
    const MIN_SIZE = 15 * 1024;
    const MAX_SIZE = 10 * 1024 * 1024;

    if (idCard.size < MIN_SIZE) {
      return NextResponse.json(
        {
          error:
            'The ID card image appears too small or invalid. Please upload a clear photo of your KCC Student ID card.',
        },
        { status: 400 }
      );
    }

    if (idCard.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'The uploaded file exceeds the 10 MB maximum size limit.' },
        { status: 400 }
      );
    }

    // Verify magic bytes
    const idCardBuffer = await idCard.arrayBuffer();
    const detectedType = detectImageType(idCardBuffer);
    if (!detectedType) {
      return NextResponse.json(
        {
          error:
            'The uploaded file does not match a valid image format. Please upload a genuine JPG or PNG photo.',
        },
        { status: 400 }
      );
    }

    // ── 4. AI Vision Verification with Google Gemini ───────────────────────
    const aiVerification = await verifyKccIdWithGemini(
      idCardBuffer,
      idCard.type,
      fullName
    );

    if (!aiVerification.isValid) {
      return NextResponse.json(
        {
          error: `Student ID verification failed: ${aiVerification.reason}. Please upload a clear photo of your official KCC Student ID card.`,
        },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // ── 5. Check if KCC ID already exists ──────────────────────────────────
    const { data: existingKcc } = await adminClient
      .from('profiles')
      .select('id')
      .ilike('kcc_id', kccId)
      .maybeSingle();

    if (existingKcc) {
      return NextResponse.json(
        { error: 'An account with this KCC Student ID already exists. Please log in or contact campus desk.' },
        { status: 409 }
      );
    }

    // ── 6. Create user in Supabase Auth (Passwords hashed via Bcrypt/Argon2) 
    const fullPhone = `+91${mobileDigits}`;

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        kcc_id: kccId,
        phone_number: fullPhone,
      },
    });

    if (authError || !authData.user) {
      console.error('Supabase Auth error during registration:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Could not create account with this email.' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // ── 7. Upload ID card to user-scoped private storage ───────────────────
    const ext = detectedType === 'jpeg' ? 'jpg' : 'png';
    const storagePath = `${userId}/id-card.${ext}`;

    const { error: uploadError } = await adminClient.storage
      .from('id-cards')
      .upload(storagePath, idCardBuffer, {
        contentType: idCard.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Could not upload ID card to storage bucket:', uploadError);
    }

    // ── 8. Create profile record (with graceful fallback if phone_number column not yet migrated) ───
    let profileError: any = null;
    const profilePayload: Record<string, any> = {
      id: userId,
      full_name: fullName,
      kcc_id: kccId,
      phone_number: fullPhone,
      class_name: className,
      year: year,
      section: section,
      room_number: classroomNumber,
      id_card_photo_path: storagePath,
      is_verified: true,
    };

    const initialInsert = await adminClient.from('profiles').insert(profilePayload);
    if (initialInsert.error) {
      // If column phone_number does not exist in remote DB, fallback to insert without it
      if (initialInsert.error.message?.includes('phone_number') || initialInsert.error.code === '42703') {
        delete profilePayload.phone_number;
        const retryInsert = await adminClient.from('profiles').insert(profilePayload);
        profileError = retryInsert.error;
      } else {
        profileError = initialInsert.error;
      }
    }

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up auth user to avoid orphan records
      await adminClient.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Failed to create student profile. Please try again.' },
        { status: 500 }
      );
    }

    // ── 9. Establish session cookies ───────────────────────────────────────
    try {
      const serverClient = await createClient();
      await serverClient.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
    } catch (sessionErr) {
      console.warn('Auto sign-in notice:', sessionErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      userId,
    });
  } catch (err: any) {
    console.error('Registration exception:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again later.' },
      { status: 500 }
    );
  }
}
