import { createClient } from '@/lib/supabase/server';
import { AdminOrdersQueue } from '@/components/admin/AdminOrdersQueue';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(full_name, kcc_id, class_name, year, section, room_number)')
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

      <AdminOrdersQueue initialOrders={orders || []} />
    </div>
  );
}

