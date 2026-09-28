'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, ClipboardList, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Console Overview', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Print Queue', icon: ClipboardList },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#111215] text-[#FBF9F5] border-r border-[#26282E]">
      <div className="px-6 py-6 border-b border-[#26282E]">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-black text-xl tracking-tight text-white">kairo</span>
          <span className="font-mono-code text-[11px] text-[#98948C]">/ DESK</span>
        </div>
        <p className="font-mono-code text-[10px] text-[#98948C] mt-1 uppercase tracking-wider">
          Campus Press Controller
        </p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 font-mono-code text-xs uppercase tracking-wider transition-colors',
                active
                  ? 'bg-[#1D4ED8] text-white font-bold'
                  : 'text-[#98948C] hover:bg-[#1E2026] hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#26282E] p-4 font-mono-code">
        <div className="border border-[#26282E] bg-[#17191E] p-3 text-[11px] text-[#98948C] space-y-0.5 mb-3">
          <p className="uppercase text-[10px]">Access Level</p>
          <p className="text-white font-bold">KCC Desk Administrator</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 text-xs text-[#98948C] hover:text-white py-2 cursor-pointer transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit Console</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0 border-r border-[#26282E] z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#111215] text-[#FBF9F5] border-b border-[#26282E] px-5 h-16 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-black text-xl tracking-tight text-white">kairo</span>
          <span className="font-mono-code text-[11px] text-[#98948C]">/ DESK</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white border border-[#3E424B] bg-[#1C1E24]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          <aside className="relative w-64 max-w-[80vw] bg-[#111215] h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
