import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { getAppUrl } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminClient = createAdminClient();

    // Generate a password reset link via Supabase Admin
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: cleanEmail,
      options: {
        redirectTo: `${getAppUrl()}/reset-password`,
      },
    });

    if (error || (!data?.properties?.hashed_token && !data?.properties?.action_link)) {
      console.error('[SendResetEmail] generateLink error:', error);
      // Return success to avoid leaking whether email exists
      return NextResponse.json({ success: true });
    }

    const tokenHash = data.properties.hashed_token;
    const resetLink = tokenHash
      ? `${getAppUrl()}/auth/callback?token_hash=${tokenHash}&type=recovery&next=/reset-password`
      : data.properties.action_link;

    const emailSubject = `Reset your ${APP_NAME} password`;
    const emailHtml = `
      <div style="font-family: 'Courier New', monospace; max-width: 560px; margin: 0 auto; padding: 32px; background: #FBF9F5; border: 1px solid #D8D1C3;">
        <p style="font-size: 11px; font-weight: 700; color: #65625D; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px;">
          [ ACCOUNT RECOVERY ]
        </p>
        <h1 style="font-size: 24px; font-weight: 900; color: #111215; margin: 0 0 8px; letter-spacing: -0.02em;">
          Reset Your Password
        </h1>
        <p style="font-size: 14px; color: #65625D; margin: 0 0 28px;">
          We received a request to reset the password for your ${APP_NAME} account.
        </p>

        <div style="border-top: 1px solid #E5DFD5; padding-top: 24px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #111215; margin: 0 0 16px;">
            Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetLink}"
             style="display: inline-block; background: #111215; color: #FBF9F5; font-size: 13px; font-weight: 700; padding: 12px 24px; text-decoration: none; letter-spacing: 0.05em; text-transform: uppercase;">
            Reset Password →
          </a>
        </div>

        <div style="border-top: 1px solid #E5DFD5; padding-top: 16px;">
          <p style="font-size: 11px; color: #98948C; margin: 0 0 8px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 11px; color: #65625D; word-break: break-all; margin: 0 0 16px;">
            ${resetLink}
          </p>
          <p style="font-size: 11px; color: #98948C; margin: 0;">
            If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
          </p>
        </div>

        <p style="font-size: 10px; color: #C4BEB6; margin: 24px 0 0; border-top: 1px solid #E5DFD5; padding-top: 16px;">
          ${APP_NAME} · KCC Institute of Technology and Management
        </p>
      </div>
    `;

    await sendEmail({
      to: cleanEmail,
      subject: emailSubject,
      html: emailHtml,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[SendResetEmail] Unexpected error:', err);
    return NextResponse.json({ success: true }); // Always return success to avoid email enumeration
  }
}
