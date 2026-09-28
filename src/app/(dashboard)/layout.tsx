import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

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
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
