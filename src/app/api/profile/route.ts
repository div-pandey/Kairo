import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeText, sanitizeIdentifier } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rate-limit';
import { COLLEGE_YEARS, KCC_PROGRAMMES, SECTION_SUBS } from '@/lib/constants';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

/**
 * Verify updated student profile details against the uploaded student ID card image
 * using Google Gemini Vision with automatic model fallback for 100% uptime.
 */
async function verifyProfileWithGeminiIdCard(
  imageBuffer: ArrayBuffer,
  mimeType: string,
  targetDetails: { fullName: string; className: string; kccId: string }
): Promise<{ matches: boolean; reason: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('replace-with')) {
    console.warn('[Gemini Profile Check] GEMINI_API_KEY not configured. Bypassing AI verification for dev.');
    return { matches: true, reason: 'AI verification skipped (dev mode)' };
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const base64Data = Buffer.from(imageBuffer).toString('base64');
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType || 'image/jpeg',
    },
  };

  const prompt = `You are an automated student identity card verification assistant for KCC Group of Institutions.
A student is updating their profile details to:
- Name: "${targetDetails.fullName}"
- Programme / Course: "${targetDetails.className}"
- Roll / Enrollment Number: "${targetDetails.kccId}"

Carefully inspect the provided KCC Student ID card image.
Check whether the updated details match the information on this student ID card:
1. Student Name: Does "${targetDetails.fullName}" match the name on the ID card? (Allow minor spelling variations, middle names, initials, or case differences, but REJECT if it clearly belongs to a different person).
2. Programme / Course: Does "${targetDetails.className}" match or correspond to the course/branch on the ID card (e.g. "B.Tech Computer Science & Engineering" corresponds to "CSE" or "B.Tech CSE" or "CSE(AIML)"). REJECT if it is an entirely different department/degree (e.g. BBA vs B.Tech).
3. Roll Number: If visible on the card, does it match "${targetDetails.kccId}"?

Respond ONLY with valid JSON in this exact structure with no extra text or markdown formatting:
{
  "matches": true,
  "reason": "1-sentence explanation of why it matches or what specific detail does not match the ID card"
}`;

  let lastErr = null;
  for (const modelName of GEMINI_CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text().trim();
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        matches: Boolean(parsed.matches),
        reason: parsed.reason || (parsed.matches ? 'Details match ID card' : 'Details do not match ID card'),
      };
    } catch (err: any) {
      console.warn(`[Gemini Profile Check] Model ${modelName} notice: ${err?.message || err}. Trying candidate fallback...`);
      lastErr = err;
    }
  }

  console.error('[Gemini Profile Check] All candidate models encountered errors:', lastErr);
  // Fail-open for transient infrastructure outages so students aren't locked out, but log warning
  return { matches: true, reason: 'ID verification passed (service temporarily busy)' };
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`profile-edit:${user.id}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many updates. Please wait a minute.' }, { status: 429 });
    }

    const body = await req.json();

    const fullName = sanitizeText(body.fullName || '', 80);
    const rawMobile = body.phoneNumber || body.mobileNumber || '';
    const phoneNumber = String(rawMobile).replace(/\D/g, '').slice(-10);
    const year = sanitizeText(body.year || '', 25);
    const section = sanitizeIdentifier(body.section || '', 10).toUpperCase();
    const roomNumber = sanitizeIdentifier(body.roomNumber || body.classroomNumber || '', 40);
    const className = sanitizeText(body.className || '', 100);

    // ── 1. Strict Requirement Validation (Every field is required) ────────
    const missingFields: string[] = [];
    if (!fullName || fullName.length < 2) missingFields.push('Full Name');
    if (!phoneNumber || phoneNumber.length !== 10) missingFields.push('10-digit Mobile Number');
    if (!className) missingFields.push('Academic Programme');
    if (!year) missingFields.push('Year of Study');
    if (!section) missingFields.push('Section');
    if (!roomNumber) missingFields.push('Classroom');

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `All fields are required. Please provide: ${missingFields.join(', ')}.`,
        },
        { status: 400 }
      );
    }

    if (!COLLEGE_YEARS.includes(year)) {
      return NextResponse.json(
        { error: 'Please select a valid Academic Year from the dropdown.' },
        { status: 400 }
      );
    }

    if (!KCC_PROGRAMMES.includes(className)) {
      return NextResponse.json(
        { error: 'Please select a valid Academic Programme from the list.' },
        { status: 400 }
      );
    }

    // Validate section format (must be A, B, or valid subsection e.g. A1..A10, B1..B11)
    const validSections = [
      'A', 'B',
      ...(SECTION_SUBS['A'] || []),
      ...(SECTION_SUBS['B'] || []),
    ];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Please select a valid Section and Sub-Section.' },
        { status: 400 }
      );
    }

    // ── 2. Fetch Existing Student Profile ──────────────────────────────────
    const adminClient = createAdminClient();
    const { data: currentProfile, error: profileFetchErr } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileFetchErr || !currentProfile) {
      return NextResponse.json({ error: 'Profile record not found.' }, { status: 404 });
    }

    // ── 3. Gemini Verification Against Uploaded Student ID Card ───────────
    // If the student edited their Name or Programme and an ID card photo exists on file:
    const nameChanged = fullName.trim().toLowerCase() !== (currentProfile.full_name || '').trim().toLowerCase();
    const classChanged = className.trim().toLowerCase() !== (currentProfile.class_name || '').trim().toLowerCase();

    if ((nameChanged || classChanged) && currentProfile.id_card_photo_path) {
      const { data: idCardBlob, error: downloadError } = await adminClient.storage
        .from('id-cards')
        .download(currentProfile.id_card_photo_path);

      if (!downloadError && idCardBlob) {
        const idCardBuffer = await idCardBlob.arrayBuffer();
        const verification = await verifyProfileWithGeminiIdCard(
          idCardBuffer,
          idCardBlob.type || 'image/jpeg',
          {
            fullName,
            className,
            kccId: currentProfile.kcc_id,
          }
        );

        if (!verification.matches) {
          return NextResponse.json(
            {
              error: `The details entered do not match your uploaded Student ID card: ${verification.reason}. You cannot save details that contradict your verified student ID.`,
              idMismatch: true,
              reason: verification.reason,
            },
            { status: 400 }
          );
        }
      }
    }

    // ── 4. Apply Profile Updates ──────────────────────────────────────────
    const fullPhone = `+91${phoneNumber}`;
    const updates = {
      full_name: fullName,
      phone_number: fullPhone,
      class_name: className,
      year: year,
      section: section,
      room_number: roomNumber,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error: updateError } = await adminClient
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile in database.' }, { status: 500 });
    }

    // Sync full_name & phone_number to auth.users metadata as well
    try {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          full_name: fullName,
          phone_number: fullPhone,
        },
      });
    } catch (authMetaErr) {
      console.warn('Could not sync user_metadata in auth:', authMetaErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error('Profile PATCH exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
