import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowRight, FileText, Printer, Clock, TrendingUp,
  CheckCircle, AlertCircle, Zap, BookOpen, Info,
} from 'lucide-react';

export const metadata = { title: 'Dashboard — Kairo' };

// How-to steps shown as a quick-start guide
const HOW_IT_WORKS = [
  { step: '01', title: 'Upload Files', desc: 'PDF, DOCX, PPTX, or images. Up to 20 files per order (100MB each).' },
  { step: '02', title: 'Choose Settings', desc: 'B&W or Colour, copies, single/double-sided.' },
  { step: '03', title: 'Pay at Counter', desc: 'Collect & pay in person at the print centre.' },
];

// Notice board items (static for now)
const NOTICES = [
  { type: 'info',  text: 'Print centre is open Mon–Sat, 9 AM – 5 PM.' },
  { type: 'tip',   text: 'Colour prints look best when submitted as PDF.' },
  { type: 'info',  text: 'Lab records must be single-sided as per faculty rules.' },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, kcc_id, class_name, year, section')
    .eq('id', user!.id)
    .single();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('student_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Compute stats
  const allOrders = orders ?? [];
  const totalOrders      = allOrders.length;
  const inProgressOrders = allOrders.filter(o => ['pending','accepted','printing','ready'].includes(o.status)).length;
  const completedOrders  = allOrders.filter(o => o.status === 'completed').length;
  const cancelledOrders  = allOrders.filter(o => o.status === 'cancelled').length;
  const totalSpent       = allOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total_amount ?? 0), 0);

  // Most recent order for status spotlight
  const latestOrder = allOrders[0] ?? null;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-4 py-6 sm:p-10 max-w-6xl mx-auto space-y-8 sm:space-y-10 animate-fade-in">

      {/* ── Header ───────────────────────────────── */}
      <div className="border-b border-[#E5DFD5] pb-6 sm:pb-8">
        <div className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-wider mb-2">
          [ KCC ITM STUDENT PORTAL ]
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111215]">
          {greeting}, {profile?.full_name?.split(' ')[0] ?? 'Student'}.
        </h1>
        <p className="font-mono-code text-xs text-[#65625D] mt-2">
          ID: <strong className="text-[#111215]">{profile?.kcc_id}</strong>
          {' '}·{' '}{profile?.class_name}
          {' '}·{' '}{profile?.year}
          {profile?.section ? ` (Sec ${profile.section})` : ''}
        </p>
      </div>

      {/* ── Metric Row ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-[#111215] divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD5] py-2 sm:py-5">
        {[
          { label: 'All-Time Orders', value: totalOrders,     color: '#111215' },
          { label: 'Active in Queue', value: inProgressOrders, color: '#1D4ED8' },
          { label: 'Collected',       value: completedOrders,  color: '#15803D' },
          { label: 'Total Spent',     value: `Rs.${totalSpent.toFixed(0)}`, color: '#111215' },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-3 sm:px-6 py-3 sm:py-2">
            <p className="font-mono-code text-[10px] sm:text-[11px] uppercase truncate" style={{ color }}>{label}</p>
            <p className="font-display text-2xl sm:text-3xl font-black mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2/3: Recent Orders */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent orders ledger */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-[#111215]">Recent Print Orders</h2>
              <Link href="/orders" className="font-mono-code text-xs text-[#65625D] hover:text-[#111215] transition-colors">
                View all →
              </Link>
            </div>

            {allOrders.length === 0 ? (
              <div className="bg-white border border-[#D8D1C3] p-8 sm:p-12 text-center">
                <FileText className="h-8 w-8 text-[#98948C] mx-auto mb-3" />
                <p className="font-display font-bold text-base text-[#111215]">No print orders placed yet</p>
                <p className="text-xs text-[#65625D] mt-1 max-w-sm mx-auto font-mono-code">
                  Submit your first assignment or lab record in seconds.
                </p>
                <Link
                  href="/new-order"
                  className="inline-flex items-center gap-2 mt-5 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] text-xs font-mono-code font-bold py-2.5 px-5 transition-colors"
                >
                  + Start your first order
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-[#D8D1C3] divide-y divide-[#E5DFD5]">
                {(orders as Order[]).map((order) => {
                  const fileCount = order.order_items?.length || 1;
                  return (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-[#FBF9F5] transition-colors group"
                    >
                      <div className="space-y-1 min-w-0 pr-0 sm:pr-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="font-mono-code text-xs sm:text-sm font-bold text-[#111215] group-hover:text-[#1D4ED8]">
                            {order.order_number}
                          </span>
                          <span className="font-mono-code text-[11px] text-[#65625D]">
                            ({fileCount} {fileCount === 1 ? 'file' : 'files'})
                          </span>
                        </div>
                        <p className="font-mono-code text-[11px] text-[#98948C]">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F0EBE3]">
                        <span className="font-mono-code font-bold text-sm text-[#111215]">{formatCurrency(order.total_amount)}</span>
                        <StatusBadge status={order.status} />
                        <ArrowRight className="h-4 w-4 text-[#CFC7BB] group-hover:text-[#111215] transition-colors hidden sm:block" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* How it works — editorial guide */}
          <div className="bg-white border border-[#D8D1C3]">
            <div className="px-6 py-4 border-b border-[#E5DFD5] flex items-center gap-3">
              <Zap className="h-4 w-4 text-[#111215]" />
              <h3 className="font-display font-bold text-sm text-[#111215]">How to place an order</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD5]">
              {HOW_IT_WORKS.map(({ step, title, desc }) => (
                <div key={step} className="px-6 py-5">
                  <p className="font-display text-3xl font-black text-[#E5DFD5] mb-2">{step}</p>
                  <p className="font-mono-code text-xs font-bold text-[#111215] uppercase tracking-wider">{title}</p>
                  <p className="font-mono-code text-[11px] text-[#65625D] mt-1.5 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-[#E5DFD5]">
              <Link
                href="/new-order"
                className="inline-flex items-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] font-mono-code text-xs uppercase tracking-wider font-bold py-3 px-5 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                + New Print Order
              </Link>
            </div>
          </div>
        </div>

        {/* Right 1/3: Sidebar widgets */}
        <div className="space-y-5">

          {/* Latest order spotlight */}
          {latestOrder ? (
            <div className="bg-white border border-[#D8D1C3]">
              <div className="px-5 py-4 border-b border-[#E5DFD5] flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#65625D]" />
                <p className="font-mono-code text-[11px] font-bold text-[#65625D] uppercase tracking-wider">Latest Order</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono-code text-sm font-bold text-[#111215]">{latestOrder.order_number}</p>
                  <StatusBadge status={latestOrder.status} />
                </div>
                <p className="font-mono-code text-[11px] text-[#65625D]">{formatDate(latestOrder.created_at)}</p>
                <p className="font-display text-2xl font-black text-[#111215]">{formatCurrency(latestOrder.total_amount)}</p>
                <Link
                  href={`/orders/${latestOrder.id}`}
                  className="flex items-center justify-between w-full mt-2 pt-3 border-t border-[#F0EBE3] font-mono-code text-xs text-[#65625D] hover:text-[#111215] transition-colors group"
                >
                  <span>View order details</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ) : null}

          {/* Quick stats breakdown */}
          <div className="bg-white border border-[#D8D1C3]">
            <div className="px-5 py-4 border-b border-[#E5DFD5] flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-[#65625D]" />
              <p className="font-mono-code text-[11px] font-bold text-[#65625D] uppercase tracking-wider">Order Breakdown</p>
            </div>
            <div className="divide-y divide-[#F0EBE3]">
              {[
                { icon: CheckCircle, label: 'Completed',  value: completedOrders,  color: '#15803D' },
                { icon: Printer,     label: 'In Progress', value: inProgressOrders, color: '#1D4ED8' },
                { icon: AlertCircle, label: 'Cancelled',  value: cancelledOrders,  color: '#B91C1C' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                    <span className="font-mono-code text-[11px] text-[#65625D] uppercase tracking-wider">{label}</span>
                  </div>
                  <span className="font-display font-black text-lg" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing quick ref */}
          <div className="bg-[#111215] text-white">
            <div className="px-5 py-4 border-b border-white/10">
              <p className="font-mono-code text-[11px] font-bold text-white/60 uppercase tracking-wider">Print Rates</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono-code text-xs text-white/70">B&W per page</span>
                <span className="font-display text-2xl font-black text-white">Rs.3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono-code text-xs text-white/70">Colour per page</span>
                <span className="font-display text-2xl font-black text-[#60A5FA]">Rs.5</span>
              </div>
            </div>
          </div>

          {/* Notice board */}
          <div className="bg-white border border-[#D8D1C3]">
            <div className="px-5 py-4 border-b border-[#E5DFD5] flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-[#65625D]" />
              <p className="font-mono-code text-[11px] font-bold text-[#65625D] uppercase tracking-wider">Notice Board</p>
            </div>
            <div className="divide-y divide-[#F0EBE3]">
              {NOTICES.map(({ type, text }, i) => (
                <div key={i} className="px-5 py-3.5 flex items-start gap-2.5">
                  <Info className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${type === 'tip' ? 'text-[#1D4ED8]' : 'text-[#65625D]'}`} />
                  <p className="font-mono-code text-[11px] text-[#65625D] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
