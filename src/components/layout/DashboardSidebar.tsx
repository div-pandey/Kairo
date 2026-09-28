'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, FileText, Plus, User, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DashboardSidebarProps {
  user: {
    full_name: string;
    kcc_id: string;
    class_name: string;
    year: string;
    section: string;
    is_verified?: boolean;
  } | null;
  userEmail: string;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/new-order', label: 'New Print Order', icon: Plus, highlight: true },
  { href: '/orders', label: 'My Orders', icon: FileText },
  { href: '/profile', label: 'Student Profile', icon: User },
];

export function DashboardSidebar({ user, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#FBF9F5] border-r border-[#E5DFD5]">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-[#E5DFD5]">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="font-display text-2xl font-black tracking-tight text-[#111215]">
            kairo
          </span>
          <span className="font-mono-code text-[11px] text-[#65625D]">
            / KCC ITM
          </span>
        </Link>
        <p className="font-mono-code text-[10px] text-[#98948C] mt-1 uppercase tracking-wider">
          Student Print Portal
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="p-4 border-b border-[#E5DFD5]">
        <Link
          href="/new-order"
          onClick={() => setMobileOpen(false)}
          className="w-full flex items-center justify-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] text-xs font-mono-code font-bold uppercase tracking-wider py-3 px-4 rounded-none transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>+ New Print Order</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.filter(i => !i.highlight).map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-xs font-mono-code uppercase tracking-wider transition-colors',
                active
                  ? 'bg-white border border-[#CFC7BB] text-[#111215] font-bold shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                  : 'text-[#65625D] hover:text-[#111215] hover:bg-[#F3EFE8]'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1D4ED8]" />}
            </Link>
          );
        })}
      </nav>

      {/* Student Details Card (Physical slip look) */}
      <div className="border-t border-[#E5DFD5] p-4 bg-[#F5F1EA]/60">
        <div className="border border-[#D8D1C3] bg-white p-3 space-y-1.5 font-mono-code text-[11px] mb-3">
          <div className="flex items-center justify-between gap-1.5">
            <p className="font-bold text-[#111215] truncate">{user?.full_name ?? 'Student'}</p>
            {user ? (
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 font-mono-code font-bold uppercase tracking-wider shrink-0 border border-[#111215] bg-[#F5F1EA] text-[#111215]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 font-mono-code font-bold uppercase tracking-wider shrink-0 border border-[#D8D1C3] bg-[#F5F1EA] text-[#65625D]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B45309]" />
                Incomplete
              </span>
            )}
          </div>
          <p className="text-[#65625D] text-[10px] truncate">
            {user?.kcc_id ? `ID: ${user.kcc_id}` : 'Profile Incomplete'}
          </p>
          <p className="text-[#98948C] text-[10px] truncate">{user?.class_name || userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 text-xs font-mono-code text-[#65625D] hover:text-[#B91C1C] py-2 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#FBF9F5] border-b border-[#E5DFD5] px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display font-black text-xl text-[#111215]">kairo</span>
          <span className="font-mono-code text-[11px] text-[#65625D]">/ KCC</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#111215] border border-[#CFC7BB] bg-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <aside className="relative w-64 max-w-[80vw] bg-[#FBF9F5] h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
