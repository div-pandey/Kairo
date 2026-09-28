import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

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
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
