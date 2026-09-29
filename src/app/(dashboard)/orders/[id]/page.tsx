import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PayNowButton } from '@/components/ui/PayNowButton';
import { Order, OrderItem, OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; payment?: string }>;
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { new: isNew, payment: paymentResult } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('student_id', user.id)
    .single();

  if (!order) notFound();

  const statuses: OrderStatus[] = ['pending', 'accepted', 'printing', 'ready', 'completed'];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in font-mono-code">
      
      {/* Back link */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[#65625D] hover:text-[#111215] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all orders
        </Link>
      </div>

      {/* New Order Confirmation Notice */}
      {isNew && (
        <div className="p-4 bg-[#F3EFE8] border border-[#CFC7BB] text-[#111215] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-bold text-xs uppercase tracking-wider block">
              [ REQUISITION DISPATCHED TO CAMPUS DESK ]
            </span>
            <p className="text-xs text-[#65625D]">
              Your files have been queued at the press. Status will update here in real time.
            </p>
          </div>
          <span className="kairo-stamp text-[#15803D] border-[#15803D] shrink-0 self-start sm:self-auto">
            CONFIRMED
          </span>
        </div>
      )}

      {/* Payment success banner */}
      {paymentResult === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-bold text-xs uppercase tracking-wider block flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              [ PAYMENT RECEIVED ]
            </span>
            <p className="text-xs text-green-700">
              Your PhonePe payment was successful. We&apos;ll start processing your print order shortly.
            </p>
          </div>
          <span className="kairo-stamp text-[#15803D] border-[#15803D] shrink-0 self-start sm:self-auto">
            PAID
          </span>
        </div>
      )}

      {/* The Physical Requisition Sheet */}
      <div className="bg-white border border-[#D8D1C3] p-4 sm:p-10 shadow-[0_4px_24px_-4px_rgba(25,20,15,0.06)] relative">
        {/* Corner registration marks */}
        <span className="absolute top-2 left-2 text-[10px] text-[#B5ADA0] select-none">+</span>
        <span className="absolute top-2 right-2 text-[10px] text-[#B5ADA0] select-none">+</span>
        <span className="absolute bottom-2 left-2 text-[10px] text-[#B5ADA0] select-none">+</span>
        <span className="absolute bottom-2 right-2 text-[10px] text-[#B5ADA0] select-none">+</span>

        {/* Sheet Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#111215] pb-5 mb-8 gap-4">
          <div>
            <span className="text-[10px] text-[#65625D] uppercase tracking-wider block mb-1">
              KAIRO / KCC PRINT REQUISITION RECEIPT
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#111215] tracking-tight">
              {(order as Order).order_number}
            </h1>
            <p className="text-xs text-[#65625D] mt-1">
              Logged: {formatDate(order.created_at)}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[10px] text-[#98948C] block uppercase">Current State</span>
            <div className="mt-1">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        {/* Status Lifecycle Sequence */}
        {order.status !== 'cancelled' ? (
          <div className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-[#E5DFD5]">
            <p className="text-[10px] text-[#65625D] uppercase tracking-wider mb-4">
              Lifecycle Tracker
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {statuses.map((s, idx) => {
                const isPassed = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;
                return (
                  <div
                    key={s}
                    className={`p-2.5 border text-center transition-colors ${
                      idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      isCurrent
                        ? 'border-[#111215] bg-[#111215] text-[#FBF9F5] font-bold'
                        : isPassed
                        ? 'border-[#CFC7BB] bg-[#F3EFE8] text-[#111215]'
                        : 'border-[#E5DFD5] bg-[#FBF9F5]/40 text-[#98948C]'
                    }`}
                  >
                    <span className="text-[10px] block opacity-75">0{idx + 1}</span>
                    <span className="text-xs capitalize block truncate">
                      {ORDER_STATUS_LABELS[s as OrderStatus]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-8 p-3 bg-red-50 border border-red-200 text-[#B91C1C] text-xs">
            This order has been cancelled.
          </div>
        )}

        {/* Items Specification Table */}
        <div className="space-y-4 mb-8">
          <p className="text-[10px] text-[#65625D] uppercase tracking-wider">
            Requisition Items &amp; Print Specifications
          </p>

          <div className="border border-[#E5DFD5] divide-y divide-[#E5DFD5]">
            {(order.order_items as OrderItem[] | undefined)?.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#111215]" />
                    <span className="font-bold text-xs sm:text-sm text-[#111215] truncate">
                      {item.file_name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#65625D]">
                    <span>Pages: <strong className="text-[#111215]">{item.page_count ?? 'Auto'}</strong></span>
                    <span>·</span>
                    <span>Mode: <strong className="text-[#111215] uppercase">{item.colour_mode === 'bw' ? 'B&W' : 'Colour'}</strong></span>
                    <span>·</span>
                    <span>Sides: <strong className="text-[#111215]">{item.print_side === 'both_sides' ? 'Both sides (Duplex)' : 'Separate pages'}</strong></span>
                    <span>·</span>
                    <span>Copies: <strong className="text-[#111215]">{item.copies}</strong></span>
                    <span>·</span>
                    <span>Unit: <strong className="text-[#111215]">{formatCurrency(item.price_per_page)}/pg</strong></span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] text-[#98948C] block uppercase">Item Total</span>
                  <span className="font-bold text-sm text-[#111215]">
                    {formatCurrency(item.item_total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Perforated bottom slip */}
        <div className="perforated-rule pt-6 mt-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <span className="text-[10px] text-[#65625D] uppercase tracking-wider block">
              Payable Amount
            </span>
            <span className="font-display font-black text-3xl text-[#111215]">
              {formatCurrency(order.total_amount)}
            </span>

            {/* Payment status indicator */}
            {order.payment_status === 'paid' ? (
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                <span className="text-xs font-bold text-[#15803D]">Payment received via PhonePe</span>
              </div>
            ) : order.payment_status === 'failed' ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-[#B91C1C]">Previous payment attempt failed. Please try again.</p>
                {order.status !== 'cancelled' && (
                  <PayNowButton orderId={order.id} amount={order.total_amount} />
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-[11px] text-[#65625D]">
                  {order.status !== 'cancelled'
                    ? 'Complete payment via PhonePe to confirm your order.'
                    : 'This order has been cancelled.'}
                </p>
                {order.status !== 'cancelled' && (
                  <PayNowButton orderId={order.id} amount={order.total_amount} />
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-[#FBF9F5] border border-[#E5DFD5] text-[11px] text-[#65625D] max-w-xs shrink-0">
            <strong className="text-[#111215] block uppercase mb-0.5">Pickup Location:</strong>
            KCC ITM Campus Printing Counter · Main Academic Block. Bring your student ID card.
          </div>
        </div>

      </div>

    </div>
  );
}
