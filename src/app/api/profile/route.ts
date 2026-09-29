import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeText, sanitizeIdentifier } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`profile-edit:${user.id}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many updates. Please wait a minute.' }, { status: 429 });
    }

    const body = await req.json();

    const fullName = body.fullName ? sanitizeText(body.fullName, 80) : undefined;
    const rawMobile = body.phoneNumber || body.mobileNumber;
    const phoneNumber = rawMobile ? String(rawMobile).replace(/\D/g, '').slice(-10) : undefined;
    const year = body.year ? sanitizeText(body.year, 25) : undefined;
    const section = body.section ? sanitizeIdentifier(body.section, 10) : undefined;
    const roomNumber = body.roomNumber || body.classroomNumber ? sanitizeIdentifier(body.roomNumber || body.classroomNumber, 40) : undefined;
    const className = body.className ? sanitizeText(body.className, 100) : undefined;

    if (phoneNumber && phoneNumber.length !== 10) {
      return NextResponse.json({ error: 'Mobile number must be a valid 10-digit number.' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (fullName) updates.full_name = fullName;
    if (phoneNumber) updates.phone_number = phoneNumber;
    if (year) updates.year = year;
    if (section) updates.section = section;
    if (roomNumber) updates.room_number = roomNumber;
    if (className) updates.class_name = className;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error('Profile PATCH exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
