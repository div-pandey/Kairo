'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError('Invalid student email or password.');
      setLoading(false);
      return;
    }

    // Check if admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (adminUser) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      {/* Form Canvas */}
      <div className="bg-white border border-[#D8D1C3] p-5 sm:p-10 shadow-[0_4px_20px_-4px_rgba(25,20,15,0.06)] rounded-sm">
        
        {/* Header */}
        <div className="mb-8 border-b border-[#E5DFD5] pb-5">
          <p className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-wider mb-1">
            [ STUDENT AUTHENTICATION ]
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111215] tracking-tight">
            Log in to Kairo
          </h1>
          <p className="text-sm text-[#65625D] mt-1 font-normal">
            Access your active print orders and order history
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-2"
            >
              College / Student Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul.kcc@gmail.com"
              className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3.5 py-3 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="login-password"
                className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-mono-code text-[11px] text-[#65625D] hover:text-[#1D4ED8] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          {error && (
            <div className="p-3 text-xs font-mono-code text-[#B91C1C] bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#111215] hover:bg-[#1D4ED8] disabled:opacity-50 text-[#FBF9F5] font-semibold py-3.5 px-4 text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 tracking-tight"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5DFD5] text-center text-xs text-[#65625D]">
          First time using Kairo?{' '}
          <Link
            href="/register"
            className="font-bold text-[#111215] hover:text-[#1D4ED8] underline underline-offset-2"
          >
            Register your KCC ID here
          </Link>
        </div>
      </div>
    </div>
  );
}
