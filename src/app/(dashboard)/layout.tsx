import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import Link from 'next/link';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, kcc_id, class_name, year, section, is_verified')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FBF9F5]">
      <DashboardSidebar user={profile} userEmail={user.email ?? ''} />
      <div className="flex-1 min-w-0 flex flex-col pt-16 lg:pt-0">
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-[#E5DFD5] px-5 py-3 flex flex-wrap items-center justify-center gap-4 font-mono-code text-[10px] text-[#98948C]">
          <span>© {new Date().getFullYear()} Kairo · Operated by Kairo Print Services</span>
          <span className="text-[#E5DFD5]">|</span>
          <Link href="/terms" className="hover:text-[#111215] transition-colors">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-[#111215] transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/refund" className="hover:text-[#111215] transition-colors">Refund Policy</Link>
        </footer>
      </div>
    </div>
  );
}
