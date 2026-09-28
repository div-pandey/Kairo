'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !authData.user) {
      setError('Invalid admin credentials. Please try again.');
      setLoading(false);
      return;
    }

    const { data: adminRecord, error: adminCheckError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (adminCheckError || !adminRecord) {
      await supabase.auth.signOut();
      setError('Access restricted. This account does not possess admin privileges.');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between px-4 py-6 sm:p-12 font-mono-code selection:bg-[#111215] selection:text-[#FBF9F5]">
      {/* Top bar */}
      <header className="max-w-lg mx-auto w-full flex items-baseline justify-between gap-3">
        <Link href="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-[#111215]">
            kairo
          </span>
          <span className="text-[11px] text-[#65625D]">/ DESK</span>
        </Link>
        <Link
          href="/"
          className="text-xs text-[#65625D] hover:text-[#111215] transition-colors shrink-0"
        >
          <span className="hidden sm:inline">← Return to campus home</span>
          <span className="sm:hidden">← Home</span>
        </Link>
      </header>

      {/* Main Form Sheet */}
      <main className="my-auto py-8 sm:py-12 flex justify-center">
        <div className="w-full max-w-md bg-white border border-[#D8D1C3] p-5 sm:p-12 shadow-[0_8px_30px_-6px_rgba(25,20,15,0.06)] relative">

          {/* Corner marks */}
          <span className="absolute top-2 left-2 text-[10px] text-[#B5ADA0] select-none">+</span>
          <span className="absolute top-2 right-2 text-[10px] text-[#B5ADA0] select-none">+</span>
          <span className="absolute bottom-2 left-2 text-[10px] text-[#B5ADA0] select-none">+</span>
          <span className="absolute bottom-2 right-2 text-[10px] text-[#B5ADA0] select-none">+</span>

          {/* Header */}
          <div className="border-b border-[#E5DFD5] pb-6 mb-8">
            <span className="text-[11px] font-semibold text-[#65625D] uppercase tracking-wider block mb-1">
              [ AUTHORIZED DESK CONTROLLER ]
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#111215] tracking-tight">
              Desk Console Login
            </h1>
            <p className="text-xs text-[#65625D] mt-2">
              KCC ITM Campus Printing Operations
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-[#111215] uppercase tracking-wider mb-2">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="div.pandey.html@gmail.com"
                className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-4 py-3.5 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111215] uppercase tracking-wider mb-2">
                Console Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-4 py-3.5 pr-11 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#65625D] hover:text-[#111215] cursor-pointer"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs text-[#B91C1C] bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#111215] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold py-4 px-6 text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Access Admin Console'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5DFD5] text-center text-xs text-[#65625D]">
            Student user?{' '}
            <Link
              href="/login"
              className="font-bold text-[#111215] hover:text-[#1D4ED8] underline underline-offset-2"
            >
              Go to Student Portal
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#98948C]">
        Kairo Campus Administration · Authorized Staff Only
      </footer>
    </div>
  );
}
