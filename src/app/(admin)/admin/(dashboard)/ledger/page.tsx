import { createClient } from '@/lib/supabase/server';
import { AdminLedgerView, LedgerOrder } from '@/components/admin/AdminLedgerView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLedgerPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, student_id, status, total_amount, payment_status, notes, created_at, profiles(full_name, kcc_id, class_name, year, section, phone_number), order_items(id, file_name, page_count, colour_mode, print_side, page_range, copies, item_total)')
    .order('created_at', { ascending: false });

  return (
    <div className="px-4 py-6 sm:p-10 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in font-mono-code">
      {/* Back button & Title */}
      <div className="print:hidden space-y-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-[#65625D] hover:text-[#111215] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to console overview
          </Link>
        </div>

        <div className="border-b border-[#111215] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#65625D] uppercase tracking-wider block mb-1">
              KAIRO DESK / AUDIT &amp; SETTLEMENT
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#111215] tracking-tight">
              Daily Ledger &amp; Paper Summary
            </h1>
            <p className="text-xs text-[#65625D] mt-1">
              End-of-day cash reconciliation, paper sheet consumption, and accounting audit log
            </p>
          </div>
        </div>
      </div>

      <AdminLedgerView initialOrders={(orders as unknown as LedgerOrder[]) || []} />
    </div>
  );
}
