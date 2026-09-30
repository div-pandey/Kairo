import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Suspense } from 'react';
import OrdersLoading from './loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, ArrowRight, Plus } from 'lucide-react';

export const metadata = {
  title: 'My Print Orders — Kairo',
  description: 'View and track all your campus print orders and receipts.',
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersContent />
    </Suspense>
  );
}

async function OrdersContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('student_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="px-4 py-6 sm:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-wider block mb-1">
            [ STUDENT DISPATCH ARCHIVE ]
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111215] tracking-tight">
            My Print Orders
          </h1>
          <p className="font-mono-code text-xs text-[#65625D] mt-1">
            Complete record of your campus print requisitions
          </p>
        </div>

        <Link
          href="/new-order"
          className="inline-flex items-center justify-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] text-xs font-mono-code font-bold uppercase tracking-wider py-3 px-5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Order</span>
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white border border-[#D8D1C3] p-8 sm:p-12 text-center">
          <FileText className="h-8 w-8 text-[#98948C] mx-auto mb-3" />
          <p className="font-display font-bold text-base text-[#111215]">No orders placed yet</p>
          <p className="text-xs text-[#65625D] mt-1 mb-5">
            Your submitted print requisitions will be logged here.
          </p>
          <Link
            href="/new-order"
            className="inline-flex items-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] text-xs font-mono-code font-bold py-2.5 px-4"
          >
            <span>+ Create your first print order</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#D8D1C3] divide-y divide-[#E5DFD5]">
          {(orders as Order[]).map((order) => {
            const itemCount = order.order_items?.length ?? 0;
            const totalPages = order.order_items?.reduce((s, i) => s + ((i.page_count ?? 0) * i.copies), 0) ?? 0;

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-[#FBF9F5] transition-colors group"
              >
                <div className="space-y-1 min-w-0 pr-0 sm:pr-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-mono-code text-sm font-bold text-[#111215] group-hover:text-[#1D4ED8]">
                      {order.order_number}
                    </span>
                    <span className="font-mono-code text-[11px] text-[#65625D]">
                      · {itemCount} {itemCount === 1 ? 'file' : 'files'} ({totalPages} pgs)
                    </span>
                  </div>
                  <p className="font-mono-code text-[11px] text-[#98948C]">
                    Submitted: {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F0EBE3]">
                  <span className="font-mono-code font-bold text-sm sm:text-base text-[#111215]">
                    {formatCurrency(order.total_amount)}
                  </span>
                  <StatusBadge status={order.status} />
                  <ArrowRight className="h-4 w-4 text-[#CFC7BB] group-hover:text-[#111215] transition-colors hidden sm:block" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
