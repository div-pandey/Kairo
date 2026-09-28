import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, FileText } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: allOrders } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(full_name, kcc_id, class_name, year, section)')
    .order('created_at', { ascending: false });

  const today = new Date().toISOString().split('T')[0];

  const stats = {
    pending: allOrders?.filter((o) => o.status === 'pending').length ?? 0,
    today: allOrders?.filter((o) => o.created_at?.startsWith(today)).length ?? 0,
    completed: allOrders?.filter((o) => o.status === 'completed').length ?? 0,
    bwPages:
      allOrders?.reduce(
        (s, o) =>
          s +
          (o.order_items
            ?.filter((i: { colour_mode: string }) => i.colour_mode === 'bw')
            .reduce(
              (si: number, i: { page_count: number; copies: number }) =>
                si + (i.page_count ?? 0) * i.copies,
              0
            ) ?? 0),
        0
      ) ?? 0,
    colourPages:
      allOrders?.reduce(
        (s, o) =>
          s +
          (o.order_items
            ?.filter((i: { colour_mode: string }) => i.colour_mode === 'colour')
            .reduce(
              (si: number, i: { page_count: number; copies: number }) =>
                si + (i.page_count ?? 0) * i.copies,
              0
            ) ?? 0),
        0
      ) ?? 0,
    revenue:
      allOrders
        ?.filter((o) => o.status !== 'cancelled')
        .reduce((s, o) => s + (o.total_amount ?? 0), 0) ?? 0,
  };

  const recentOrders = allOrders?.slice(0, 10) ?? [];

  return (
    <div className="px-4 py-6 sm:p-10 max-w-6xl mx-auto space-y-8 sm:space-y-10 animate-fade-in font-mono-code">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-[#65625D] uppercase tracking-wider block mb-1">
            [ KAIRO / CAMPUS PRINT DISPATCH CONTROLLER ]
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111215] tracking-tight">
            Print Desk Console
          </h1>
          <p className="text-xs text-[#65625D] mt-1">
            KCC ITM Campus Printing Operations
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[#1D4ED8] hover:underline"
        >
          <span>View entire queue ({allOrders?.length ?? 0} jobs)</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Metrics Row (Physical Ledger Style, not rounded cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-y border-[#111215] gap-4 py-4 sm:py-5">
        <div className="px-4 py-2 sm:py-0">
          <p className="text-[10px] text-[#B45309] uppercase font-bold">Pending Jobs</p>
          <p className="font-display text-3xl font-black text-[#B45309] mt-1">{stats.pending}</p>
        </div>
        <div className="px-4 py-2 sm:py-0">
          <p className="text-[10px] text-[#65625D] uppercase">Orders Today</p>
          <p className="font-display text-3xl font-black text-[#111215] mt-1">{stats.today}</p>
        </div>
        <div className="px-4 py-2 sm:py-0">
          <p className="text-[10px] text-[#15803D] uppercase font-bold">Completed</p>
          <p className="font-display text-3xl font-black text-[#15803D] mt-1">{stats.completed}</p>
        </div>
        <div className="px-4 py-2 sm:py-0">
          <p className="text-[10px] text-[#65625D] uppercase">B&amp;W Pages</p>
          <p className="font-display text-3xl font-black text-[#111215] mt-1">{stats.bwPages.toLocaleString()}</p>
        </div>
        <div className="px-4 py-2 sm:py-0">
          <p className="text-[10px] text-[#1D4ED8] uppercase">Colour Pages</p>
          <p className="font-display text-3xl font-black text-[#1D4ED8] mt-1">{stats.colourPages.toLocaleString()}</p>
        </div>
        <div className="px-4 py-2 sm:py-0">
          <p className="text-[10px] text-[#65625D] uppercase">Total Revenue</p>
          <p className="font-display text-2xl font-black text-[#111215] mt-1">{formatCurrency(stats.revenue)}</p>
        </div>
      </div>

      {/* Recent Print Queue */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-[#111215]">
            Recent Print Requisitions
          </h2>
          <span className="text-xs text-[#65625D]">Showing latest 10 jobs</span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white border border-[#D8D1C3] p-12 text-center text-[#65625D]">
            <FileText className="h-8 w-8 mx-auto text-[#98948C] mb-2" />
            <p className="font-bold text-sm text-[#111215]">No orders received yet</p>
          </div>
        ) : (
          <div className="bg-white border border-[#D8D1C3] divide-y divide-[#E5DFD5]">
            {recentOrders.map((order) => {
              const profile = (order as any).profiles;
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FBF9F5] transition-colors group"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#111215] group-hover:text-[#1D4ED8]">
                        {order.order_number}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-[#65625D]">
                      {profile?.full_name} · Roll: <strong className="text-[#111215]">{profile?.kcc_id}</strong> ({profile?.class_name})
                    </p>
                    <p className="text-[11px] text-[#98948C]">
                      Received: {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <span className="font-bold text-base text-[#111215]">
                      {formatCurrency(order.total_amount)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#CFC7BB] group-hover:text-[#111215] transition-colors hidden sm:block" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
