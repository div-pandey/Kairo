'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        setError(resetError.message || 'Could not send password recovery link.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-[#D8D1C3] p-5 sm:p-10 shadow-[0_4px_20px_-4px_rgba(25,20,15,0.06)] rounded-sm">
        
        {/* Header */}
        <div className="mb-8 border-b border-[#E5DFD5] pb-5">
          <p className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-wider mb-1">
            [ ACCOUNT RECOVERY ]
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111215] tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-[#65625D] mt-1 font-normal">
            Enter your registered student email to receive recovery instructions
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                <span>Recovery Link Sent</span>
              </div>
              <p className="text-xs font-mono-code leading-relaxed">
                We have dispatched a password recovery email to <strong>{email}</strong>. Check your inbox and spam folder, then click the link to set a new password.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] font-semibold py-3 px-4 text-xs font-mono-code uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-5">
            <div>
              <label
                htmlFor="reset-email"
                className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-2"
              >
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student.kcc@gmail.com"
                  className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3.5 py-3 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs font-mono-code text-[#B91C1C] bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111215] hover:bg-[#1D4ED8] disabled:opacity-50 text-[#FBF9F5] font-semibold py-3.5 px-4 text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 tracking-tight"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Email</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-[#E5DFD5] text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 font-mono-code text-xs text-[#65625D] hover:text-[#111215] transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Back to sign in
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
