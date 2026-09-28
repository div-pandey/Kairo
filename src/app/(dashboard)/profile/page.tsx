import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Check, User, BookOpen, MapPin,
  Mail, Hash, Calendar, GraduationCap, Phone,
  FileText, Printer, Clock, ChevronRight,
  AlertTriangle, AlertCircle,
} from 'lucide-react';

export const metadata = { title: 'Student Profile — Kairo' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) redirect('/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .maybeSingle();

  // Fetch order stats
  const { data: orders } = await supabase
    .from('orders')
    .select('status, total_amount, created_at')
    .eq('student_id', user!.id)
    .order('created_at', { ascending: false });

  const totalOrders = orders?.length ?? 0;
  const totalSpent = orders?.reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0;
  const completedOrders = orders?.filter(o => o.status === 'completed').length ?? 0;
  const activeOrders = orders?.filter(o => ['pending', 'accepted', 'printing', 'ready'].includes(o.status)).length ?? 0;
  const memberSince = new Date(user!.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const daysSinceJoin = Math.floor((Date.now() - new Date(user!.created_at).getTime()) / (1000 * 60 * 60 * 24));

  // If profile doesn't exist yet show a helpful message instead of redirect-looping
  if (!profile) {
    return (
      <div className="px-4 py-6 sm:p-10 max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
        <div className="border-b border-[#E5DFD5] pb-7">
          <span className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-wider block mb-1.5">
            [ STUDENT RECORD / KCC ITM PORTAL ]
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#111215]">Student Profile</h1>
        </div>
        <div className="bg-white border border-[#D8D1C3] p-8 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-bold text-sm text-[#111215]">Profile record not found</p>
            <p className="font-mono-code text-xs text-[#65625D] mt-1 leading-relaxed">
              Your student profile could not be loaded. This may happen if your account was created before profile data was set up.
              {profileError && <span className="block mt-1 text-[#B91C1C]">DB error: {profileError.message}</span>}
            </p>
            <p className="font-mono-code text-xs text-[#65625D] mt-2">Logged in as: <strong className="text-[#111215]">{user!.email}</strong></p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 mt-4 bg-[#111215] text-[#FBF9F5] text-xs font-mono-code font-bold py-2.5 px-4 hover:bg-[#1D4ED8] transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">

      {/* Page Header */}
      <div className="border-b border-[#E5DFD5] pb-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-wider block mb-1.5">
            [ STUDENT RECORD / KCC ITM PORTAL ]
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111215]">
            Student Profile
          </h1>
          <p className="font-mono-code text-xs text-[#65625D] mt-1.5">
            Member since {memberSince} &middot; {daysSinceJoin} days on Kairo
          </p>
        </div>
        <div className="inline-flex items-center gap-2 font-mono-code text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 self-start sm:self-auto border border-[#111215] bg-white text-[#111215] shadow-[2px_2px_0px_#111215]">
          <span className="h-2 w-2 rounded-full bg-[#15803D]" />
          <span>Verified Student</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">

          {/* Identity Card */}
          <div className="bg-white border border-[#D8D1C3] shadow-[0_4px_24px_-4px_rgba(25,20,15,0.07)]">
            <div className="bg-[#111215] px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-mono-code text-[10px] text-[#98948C] uppercase tracking-widest">KCC Institute of Technology &amp; Management</p>
                <p className="font-mono-code text-[11px] text-white/70 mt-0.5">Kairo Student Print Portal</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#1D4ED8] flex items-center justify-center">
                <Printer className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#E5DFD5] pb-5 mb-5 gap-4">
                <div>
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#F3EFE8] border border-[#D8D1C3] flex items-center justify-center mb-3">
                    <User className="h-6 w-6 sm:h-7 sm:w-7 text-[#65625D]" />
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-[#111215] tracking-tight leading-tight">
                    {profile.full_name}
                  </h2>
                  <p className="font-mono-code text-xs text-[#65625D] mt-1">
                    Roll No. <strong className="text-[#111215]">{profile.kcc_id}</strong>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono-code text-[10px] text-[#98948C] uppercase tracking-wider">Print Tier</p>
                  <p className="font-mono-code text-sm font-bold text-[#111215] mt-0.5">Student</p>
                  <p className="font-mono-code text-[10px] text-[#15803D] mt-1 font-bold">Active</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {[
                  { icon: Mail,          label: 'Email Address', value: user!.email ?? 'N/A' },
                  { icon: Phone,         label: 'Mobile Number', value: profile.phone_number || (user!.user_metadata?.phone_number ?? 'N/A') },
                  { icon: GraduationCap, label: 'Programme',     value: profile.class_name ?? 'N/A' },
                  { icon: Calendar,      label: 'Academic Year', value: profile.year ?? 'N/A' },
                  { icon: Hash,          label: 'Section',       value: profile.section ? `Section ${profile.section}` : 'N/A' },
                  { icon: MapPin,        label: 'Classroom',     value: profile.room_number ?? 'N/A' },
                  { icon: BookOpen,      label: 'Institution',   value: 'KCC ITM, Greater Noida' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="py-3.5 flex items-start gap-3 border-b border-[#F0EBE3] last:border-0">
                    <Icon className="h-3.5 w-3.5 text-[#98948C] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono-code text-[10px] text-[#98948C] uppercase tracking-wider">{label}</p>
                      <p className="font-mono-code text-xs font-bold text-[#111215] mt-0.5 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-[#CFC7BB]">
                <p className="font-mono-code text-[11px] text-[#98948C] text-center">
                  Authorized for subsidized campus print rates &mdash; Rs.3 B&amp;W &middot; Rs.5 Colour
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white border border-[#D8D1C3]">
            <div className="px-6 py-4 border-b border-[#E5DFD5] flex items-center gap-3">
              <Shield className="h-4 w-4 text-[#111215]" />
              <h3 className="font-display font-bold text-sm text-[#111215]">Privacy &amp; Security</h3>
            </div>
            <div className="divide-y divide-[#F0EBE3]">
              {[
                { label: 'Account Email',    sub: user!.email ?? '',                                 badge: 'CONFIRMED', green: true  },
                { label: 'ID Verification',  sub: 'Official KCC Student ID Card Verified',           badge: 'VERIFIED',  green: true  },
                { label: 'Password Storage', sub: 'Stored as bcrypt hash — never plain text',        badge: 'SECURED',   green: false },
              ].map(({ label, sub, badge, green }) => (
                <div key={label} className="px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-mono-code text-xs font-bold text-[#111215]">{label}</p>
                    <p className="font-mono-code text-[11px] text-[#65625D] mt-0.5 truncate">{sub}</p>
                  </div>
                  <span
                    className={`font-mono-code text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shrink-0 border ${
                      green
                        ? 'border-[#111215] bg-[#F5F1EA] text-[#111215]'
                        : 'border-[#CFC7BB] bg-white text-[#65625D]'
                    }`}
                  >
                    {green && <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#15803D] mr-1.5 align-middle" />}
                    {badge}
                  </span>
                </div>
              ))}
              <div className="px-6 py-4 bg-amber-50/60">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="font-mono-code text-[11px] text-amber-800">
                    Your personal data is stored securely in Supabase with row-level security. ID photos are used only for verification and never shared.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Print Stats */}
          <div className="bg-white border border-[#D8D1C3]">
            <div className="px-5 py-4 border-b border-[#E5DFD5]">
              <p className="font-mono-code text-[11px] font-bold text-[#65625D] uppercase tracking-wider">Print Activity</p>
            </div>
            <div className="divide-y divide-[#F0EBE3]">
              {[
                { label: 'Total Orders',    value: totalOrders,                   color: '#111215' },
                { label: 'Completed',       value: completedOrders,               color: '#15803D' },
                { label: 'Active in Queue', value: activeOrders,                  color: '#1D4ED8' },
                { label: 'Total Spent',     value: `Rs.${totalSpent.toFixed(2)}`, color: '#111215' },
              ].map(({ label, value, color }) => (
                <div key={label} className="px-5 py-3.5 flex justify-between items-center">
                  <p className="font-mono-code text-[11px] text-[#65625D] uppercase tracking-wider">{label}</p>
                  <p className="font-display font-black text-lg" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#111215] text-white">
            <div className="px-5 py-4 border-b border-white/10">
              <p className="font-mono-code text-[11px] font-bold text-white/60 uppercase tracking-wider">Campus Print Rates</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono-code text-xs text-white/70">B&amp;W per page</span>
                <span className="font-display text-xl font-black text-white">Rs.3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono-code text-xs text-white/70">Colour per page</span>
                <span className="font-display text-xl font-black text-[#60A5FA]">Rs.5</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="font-mono-code text-[10px] text-white/40">Subsidized rate — KCC students only</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#D8D1C3]">
            <div className="px-5 py-4 border-b border-[#E5DFD5]">
              <p className="font-mono-code text-[11px] font-bold text-[#65625D] uppercase tracking-wider">Quick Actions</p>
            </div>
            <div className="divide-y divide-[#F0EBE3]">
              {[
                { href: '/new-order', icon: Printer,  label: 'Place New Print Order' },
                { href: '/orders',    icon: FileText,  label: 'View All My Orders' },
                { href: '/dashboard', icon: Clock,     label: 'Back to Dashboard' },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FBF9F5] transition-colors group">
                  <div className="flex items-center gap-3">
                    <Icon className="h-3.5 w-3.5 text-[#98948C] group-hover:text-[#111215] transition-colors" />
                    <span className="font-mono-code text-xs text-[#65625D] group-hover:text-[#111215] transition-colors">{label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#CFC7BB] group-hover:text-[#111215] transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Account UID */}
          <div className="border border-[#E5DFD5] bg-[#F5F1EA]/60 px-5 py-4">
            <p className="font-mono-code text-[10px] text-[#98948C] uppercase tracking-wider mb-1.5">Kairo Account UID</p>
            <p className="font-mono-code text-[10px] text-[#65625D] break-all leading-relaxed">{user!.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
