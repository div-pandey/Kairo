import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, FileText } from 'lucide-react';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(full_name, kcc_id, class_name, year, section)')
    .order('created_at', { ascending: false });

  return (
    <div className="px-4 py-6 sm:p-10 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in font-mono-code">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-semibold text-[#65625D] uppercase tracking-wider block mb-1">
            [ CAMPUS QUEUE / KCC ITM ]
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111215] tracking-tight">
            Print Requisition Queue
          </h1>
          <p className="text-xs text-[#65625D] mt-1">
            {orders?.length ?? 0} total print orders submitted
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#D8D1C3]">
        {!orders || orders.length === 0 ? (
          <div className="py-16 text-center text-[#65625D]">
            <FileText className="h-8 w-8 mx-auto text-[#98948C] mb-2" />
            <p className="font-bold text-sm text-[#111215]">No orders in queue</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (Visible on mobile/tablet) */}
            <div className="divide-y divide-[#E5DFD5] md:hidden">
              {(orders as Order[]).map((order) => {
                const profile = (order as any).profiles;
                return (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-[#111215]">
                        {order.order_number}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-[#111215]">{profile?.full_name}</p>
                      <p className="text-[11px] text-[#65625D]">
                        Roll: {profile?.kcc_id} · {profile?.class_name}
                      </p>
                      <p className="text-[11px] text-[#98948C]">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE3]">
                      <span className="font-bold text-base text-[#111215]">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111215] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider"
                      >
                        <span>Manage</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (Hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#111215] bg-[#F5F1EA] text-[#111215] uppercase text-[10px] tracking-wider">
                    <th className="text-left px-5 py-3.5 font-bold">Order ID</th>
                    <th className="text-left px-5 py-3.5 font-bold">Student Record</th>
                    <th className="text-left px-5 py-3.5 font-bold">Submitted</th>
                    <th className="text-left px-5 py-3.5 font-bold">Amount</th>
                    <th className="text-left px-5 py-3.5 font-bold">Status</th>
                    <th className="text-right px-5 py-3.5 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {(orders as Order[]).map((order) => {
                    const profile = (order as any).profiles;
                    return (
                      <tr key={order.id} className="hover:bg-[#FBF9F5] transition-colors">
                        <td className="px-5 py-4 font-bold text-[#111215] whitespace-nowrap">
                          {order.order_number}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#111215]">{profile?.full_name}</p>
                          <p className="text-[11px] text-[#65625D]">
                            Roll: {profile?.kcc_id} · {profile?.class_name}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-[#65625D] text-[11px] whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#111215] text-sm whitespace-nowrap">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 font-bold text-[#111215] hover:text-[#1D4ED8]"
                          >
                            <span>Manage</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
