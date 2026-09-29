import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminAudioAlert } from '@/components/admin/AdminAudioAlert';
import Link from 'next/link';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminUser) redirect('/login');
  return user;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdmin();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <AdminAudioAlert />
      <div className="flex-1 min-w-0 flex flex-col pt-16 lg:pt-0">
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-[#E5DFD5] px-5 py-3 flex flex-wrap items-center justify-center gap-4 font-mono-code text-[10px] text-[#98948C]">
          <span>© {new Date().getFullYear()} Kairo · Desk Admin Portal</span>
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
