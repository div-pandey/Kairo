import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  const supabase = await createClient();

  // 1. PKCE Code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 2. Token hash verification (OTP / Password Recovery / Email Confirmation)
  // verifyOtp on the server sets the authenticated session cookies directly onto the response!
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('[AuthCallback] verifyOtp error:', error);
  }

  // 3. Fallback for client hash redirects
  if (next.startsWith('/reset-password')) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not verify reset session. Please request a new link.`
  );
}
