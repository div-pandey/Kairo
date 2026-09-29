'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-type.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || 'Could not update password.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2500);
    } catch {
      setError('Something went wrong. Please check your connection.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-[#D8D1C3] p-5 sm:p-10 shadow-[0_4px_20px_-4px_rgba(25,20,15,0.06)] rounded-sm">
        
        {/* Header */}
        <div className="mb-8 border-b border-[#E5DFD5] pb-5">
          <p className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-wider mb-1">
            [ SECURITY CREDENTIALS ]
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111215] tracking-tight">
            New Password
          </h1>
          <p className="text-sm text-[#65625D] mt-1 font-normal">
            Create a secure password for your Kairo account
          </p>
        </div>

        {success ? (
          <div className="space-y-5">
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                <span>Password Updated Successfully</span>
              </div>
              <p className="text-xs font-mono-code">
                Your new password is now active. Redirecting you to your dashboard...
              </p>
            </div>

            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] font-semibold py-3.5 px-4 text-sm transition-colors"
            >
              <span>Go to Dashboard Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3.5 py-3 pr-10 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65625D] hover:text-[#111215]"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type={showPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3.5 py-3 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]"
              />
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
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
