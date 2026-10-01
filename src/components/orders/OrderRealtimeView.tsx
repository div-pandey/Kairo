'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Order, OrderItem, OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Check,
  Printer,
  Sparkles,
  MessageSquare,
  Clock,
  Radio,
  QrCode,
  X,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Share2,
} from 'lucide-react';
import { FileThumbnail } from '@/components/files/FileThumbnail';

interface Props {
  order: Order & { order_items?: OrderItem[]; profiles?: any };
  isNew?: boolean;
  paymentResult?: string;
  initialQueueAhead?: number;
}

const LIFECYCLE_STATUSES: OrderStatus[] = ['pending', 'accepted', 'printing', 'ready', 'completed'];

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: 'Your requisition is queued at the campus desk waiting for staff review.',
  accepted: 'Print staff has accepted your files and queued them for printing.',
  printing: 'Your files are currently on the press machine being printed.',
  ready: 'Your printout is ready! Collect it from the Ground Floor Printing Counter.',
  completed: 'Document handed over to student. Requisition completed.',
  cancelled: 'This print requisition was cancelled.',
};

/** High-contrast Barcode Pattern component */
function BarcodeSvg({ text }: { text: string }) {
  // Generate consistent deterministic bars based on order number chars
  const bars = text.split('').map((char, i) => {
    const code = char.charCodeAt(0);
    const width = (code % 3) + 1;
    const isDark = (code + i) % 2 === 0;
    return { width, isDark };
  });

  return (
    <div className="flex items-center justify-center gap-0.5 h-12 bg-white px-2 py-1">
      {bars.map((bar, idx) => (
        <span
          key={idx}
          className={`h-full inline-block ${bar.isDark ? 'bg-[#111215]' : 'bg-transparent'}`}
          style={{ width: `${bar.width * 2}px` }}
        />
      ))}
    </div>
  );
}

/** Vector QR code grid generator */
function QrMatrixSvg({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  // Deterministic 15x15 visual pattern for the order
  const size = 17;
  const hash = (orderId + orderNumber).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  const cells: boolean[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      // Corner alignment markers
      if ((r < 4 && c < 4) || (r < 4 && c >= size - 4) || (r >= size - 4 && c < 4)) {
        if (r === 0 || r === 3 || c === 0 || c === 3) return true;
        if (r === 0 || r === 3 || c === size - 1 || c === size - 4) return true;
        if (r === size - 1 || r === size - 4 || c === 0 || c === 3) return true;
        if (r === 1 && c === 1) return true;
        if (r === 1 && c === size - 2) return true;
        if (r === size - 2 && c === 1) return true;
      }
      return ((r * c + hash + r + c) % 3 === 0);
    })
  );

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-32 h-32 bg-white p-2 border border-[#CFC7BB]">
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#111215" /> : null
        )
      )}
    </svg>
  );
}

export function OrderRealtimeView({ order: initialOrder, isNew, paymentResult, initialQueueAhead = 0 }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialOrder.status);
  const [queueAhead, setQueueAhead] = useState<number>(initialQueueAhead);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [statusPulse, setStatusPulse] = useState(false);
  
  // Modals
  const [showPassModal, setShowPassModal] = useState(false);
  const [passCopied, setPassCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus && newStatus !== status) {
      setStatus(newStatus);
      setStatusPulse(true);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setTimeout(() => setStatusPulse(false), 5000);
    }
  };

  // Real-time Supabase Subscription & Polling Fallback
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime-order-${initialOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${initialOrder.id}`,
        },
        (payload: any) => {
          if (payload.new?.status) {
            handleStatusChange(payload.new.status as OrderStatus);
          }
        }
      )
      .subscribe();

    let pollInterval: NodeJS.Timeout | null = null;
    const isActive = status !== 'completed' && status !== 'cancelled';

    if (isActive) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${initialOrder.id}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.status && data.status !== status) {
              handleStatusChange(data.status as OrderStatus);
            }
            if (typeof data.queueAhead === 'number') {
              setQueueAhead(data.queueAhead);
            }
          }
        } catch {
          // ignore
        }
      }, 5000);
    }

    return () => {
      supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [initialOrder.id, status]);

  async function handleCancelOrder() {
    setCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/orders/${initialOrder.id}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      setStatus('cancelled');
      setShowCancelModal(false);
      router.refresh();
    } catch (err: any) {
      setCancelError(err.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  }

  const currentStatusIndex = LIFECYCLE_STATUSES.indexOf(status);

  return (
    <div className="space-y-6 sm:space-y-8 font-mono-code">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5DFD5]">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[#65625D] hover:text-[#111215] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all orders
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Digital Pickup Pass Button */}
          <button
            onClick={() => setShowPassModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer shadow-sm"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Show Pickup Pass</span>
          </button>

          {/* Cancel Order Button (Only when pending) */}
          {status === 'pending' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 border border-[#B91C1C] text-[#B91C1C] hover:bg-red-50 text-xs font-bold uppercase tracking-wider px-3 py-2 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel Order</span>
            </button>
          )}

          {/* Re-Order Button */}
          <Link
            href="/new-order"
            className="inline-flex items-center gap-1.5 border border-[#CFC7BB] bg-white hover:border-[#111215] text-[#111215] text-xs font-bold uppercase tracking-wider px-3 py-2 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Re-Order</span>
          </Link>

          {status !== 'completed' && status !== 'cancelled' ? (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#15803D] bg-green-50/80 border border-green-200 px-2.5 py-1">
              <Radio className="h-3 w-3 animate-pulse text-[#15803D]" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">Live Sync</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Dynamic Estimated Turnaround Time Badge */}
      {status !== 'completed' && status !== 'cancelled' && (
        <div className="bg-white border-2 border-[#111215] p-3.5 sm:p-4 shadow-[2px_2px_0px_#111215] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2 border shrink-0 ${
              status === 'ready'
                ? 'bg-green-100 border-green-600 text-green-700'
                : status === 'printing'
                ? 'bg-purple-100 border-purple-600 text-purple-700'
                : 'bg-amber-100 border-amber-600 text-amber-700'
            }`}>
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#65625D]">
                  Estimated Turnaround Time
                </span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#111215] mt-0.5">
                {status === 'ready' ? (
                  <span className="text-[#15803D]">
                    Zero Wait Time · Your documents are in the counter pickup tray!
                  </span>
                ) : status === 'printing' ? (
                  <span className="text-[#6D28D9]">
                    Currently on Press · Est. ready in ~2–5 mins
                  </span>
                ) : queueAhead > 0 ? (
                  <>
                    Queue: <span className="underline">{queueAhead} {queueAhead === 1 ? 'order' : 'orders'} ahead of you</span> · Est. pickup: <span className="text-[#1D4ED8] font-black">~{queueAhead * 4 + 4}–{queueAhead * 6 + 10} mins</span>
                  </>
                ) : (
                  <>
                    You are <span className="text-[#15803D]">next in queue</span> · Est. pickup: <span className="text-[#1D4ED8] font-black">~5–8 mins</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-[11px] text-[#65625D] shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E5DFD5]">
            <span className="block text-[10px] text-[#98948C] uppercase">Pickup Desk</span>
            <span className="font-bold text-[#111215]">Ground Floor Printing Counter</span>
          </div>
        </div>
      )}

      {/* Live Status Pulse Notification */}
      {statusPulse && (
        <div className="p-4 bg-[#111215] text-[#FBF9F5] border border-[#111215] flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Status updated to &ldquo;{ORDER_STATUS_LABELS[status]}&rdquo; {lastUpdated ? `at ${lastUpdated}` : ''}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">Verified</span>
        </div>
      )}

      {/* Ready for Collection Notice with Tactile Rubber Stamp */}
      {status === 'ready' && (
        <div className="p-5 bg-green-50 border-2 border-[#15803D] text-[#15803D] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>YOUR PRINTOUT IS READY FOR PICKUP!</span>
            </div>
            <p className="text-xs text-green-800">
              Please head to the <strong>KCC Printing Counter (Ground Floor)</strong> and present your Order Number: <strong>{initialOrder.order_number}</strong> or the digital pass.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="kairo-stamp-animated kairo-stamp-ready">
              READY FOR PICKUP
            </span>
            <button
              onClick={() => setShowPassModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#15803D] hover:bg-green-800 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 transition-colors cursor-pointer"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Open Pass</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 border border-[#15803D] bg-white text-[#15803D] hover:bg-green-50 text-xs font-bold uppercase tracking-wider px-3 py-2.5 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      )}

      {/* Cancelled Notice */}
      {status === 'cancelled' && (
        <div className="p-4 bg-red-50 border border-red-200 text-[#B91C1C] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>This order was cancelled. No printout will be processed for this requisition.</span>
          </div>
          <Link
            href="/new-order"
            className="font-bold underline uppercase tracking-wider shrink-0"
          >
            Create New Order →
          </Link>
        </div>
      )}

      {/* New Order Confirmation Notice with Tactile Stamp */}
      {isNew && status !== 'ready' && status !== 'cancelled' && (
        <div className="p-4 bg-[#F3EFE8] border border-[#CFC7BB] text-[#111215] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-bold text-xs uppercase tracking-wider block">
              [ REQUISITION DISPATCHED TO CAMPUS DESK ]
            </span>
            <p className="text-xs text-[#65625D]">
              Your files have been queued at the press. Status will update here in real time.
            </p>
          </div>
          <span className="kairo-stamp-animated kairo-stamp-confirmed shrink-0 self-start sm:self-auto">
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
          <span className="kairo-stamp-animated kairo-stamp-ready shrink-0 self-start sm:self-auto">
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
              {initialOrder.order_number}
            </h1>
            <p className="text-xs text-[#65625D] mt-1">
              Logged: {formatDate(initialOrder.created_at)}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[10px] text-[#98948C] block uppercase">Current State</span>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
            <p className="text-[10px] text-[#65625D] mt-1 max-w-[220px] sm:text-right">
              {STATUS_DESCRIPTIONS[status]}
            </p>
          </div>
        </div>

        {/* Lifecycle Tracker */}
        {status !== 'cancelled' ? (
          <div className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-[#E5DFD5]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-[#65625D] uppercase tracking-wider">
                Lifecycle Tracker
              </p>
              <span className="text-[10px] text-[#98948C] flex items-center gap-1">
                <Clock className="h-3 w-3" /> Auto-updates on desk progress
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {LIFECYCLE_STATUSES.map((s, idx) => {
                const isPassed = currentStatusIndex > idx;
                const isCurrent = currentStatusIndex === idx;
                const labels: Record<OrderStatus, string> = {
                  pending: 'Pending',
                  accepted: 'Accepted',
                  printing: 'Printing',
                  ready: 'Ready for Collection',
                  completed: 'Completed',
                  cancelled: 'Cancelled',
                };
                return (
                  <div
                    key={s}
                    className={`p-2.5 border text-center transition-all relative ${
                      idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      isCurrent
                        ? 'border-[#111215] bg-[#111215] text-[#FBF9F5] font-bold shadow-sm'
                        : isPassed
                        ? 'border-[#15803D] bg-green-50 text-[#15803D]'
                        : 'border-[#E5DFD5] bg-[#FBF9F5]/40 text-[#98948C]'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="h-3.5 w-3.5 mx-auto mb-0.5 text-[#15803D]" />
                    ) : (
                      <span className="text-[10px] block opacity-75">0{idx + 1}</span>
                    )}
                    <span className="text-[10px] capitalize block leading-tight">
                      {labels[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Special Instructions / Notes Banner */}
        {initialOrder.notes && (
          <div className="mb-8 p-4 bg-[#FBF9F5] border border-[#CFC7BB] text-xs space-y-1">
            <div className="flex items-center gap-2 text-[#111215] font-bold uppercase tracking-wider text-[11px]">
              <MessageSquare className="h-3.5 w-3.5 text-[#1D4ED8]" />
              <span>Special Instructions for Print Desk:</span>
            </div>
            <p className="text-[#111215] whitespace-pre-wrap pl-5 font-mono-code">
              &ldquo;{initialOrder.notes}&rdquo;
            </p>
          </div>
        )}

        {/* Items Specification Table */}
        <div className="space-y-4 mb-8">
          <p className="text-[10px] text-[#65625D] uppercase tracking-wider">
            Requisition Items &amp; Print Specifications
          </p>

          <div className="border border-[#E5DFD5] divide-y divide-[#E5DFD5]">
            {(initialOrder.order_items as OrderItem[] | undefined)?.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-3">
                    <FileThumbnail name={item.file_name} type={item.file_type} />
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
                    {item.page_range && item.page_range !== 'all' && (
                      <>
                        <span>·</span>
                        <span>Print Range: <strong className="text-[#1D4ED8] bg-blue-50 px-1 border border-blue-200">{item.page_range}</strong></span>
                      </>
                    )}
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

        {/* Bottom info — pickup only; payment was collected upfront */}
        <div className="perforated-rule pt-6 mt-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#65625D] uppercase tracking-wider block mb-1">
              Order Total
            </span>
            <span className="font-display font-black text-3xl text-[#111215]">
              {formatCurrency(initialOrder.total_amount)}
            </span>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
              <span className="text-xs font-bold text-[#15803D]">Payment received via UPI</span>
            </div>
          </div>

          <div className="p-3 bg-[#FBF9F5] border border-[#E5DFD5] text-[11px] text-[#65625D] max-w-xs shrink-0">
            <strong className="text-[#111215] block uppercase mb-0.5">Pickup Location:</strong>
            KCC Campus Printing Counter · Ground Floor. Show pickup pass or quote Order #{initialOrder.order_number}.
          </div>
        </div>

      </div>

      {/* ── MODAL 1: DIGITAL PICKUP TOKEN / PASS ── */}
      {showPassModal && (
        <div
          className="fixed inset-0 bg-[#111215]/45 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowPassModal(false)}
        >
          <div
            className="bg-white border-2 border-[#111215] max-w-sm w-full p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close icon */}
            <button
              onClick={() => setShowPassModal(false)}
              className="absolute top-4 right-4 text-[#65625D] hover:text-[#111215] p-1"
              aria-label="Close pass"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Pass Header */}
            <div className="text-center border-b-2 border-[#111215] pb-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#65625D]">
                KCC ITM CAMPUS PRINT DESK
              </p>
              <h2 className="font-display text-xl font-black text-[#111215] mt-0.5">
                DIGITAL PICKUP PASS
              </h2>
            </div>

            {/* Order Number & QR Matrix */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-center">
                <span className="text-[10px] uppercase text-[#65625D] block">Token Number</span>
                <span className="font-display font-black text-3xl tracking-tight text-[#111215]">
                  {initialOrder.order_number}
                </span>
              </div>

              <QrMatrixSvg orderId={initialOrder.id} orderNumber={initialOrder.order_number} />

              <BarcodeSvg text={initialOrder.order_number} />
            </div>

            {/* Pass Meta */}
            <div className="bg-[#FBF9F5] border border-[#CFC7BB] p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#65625D]">State:</span>
                <span className="font-bold text-[#111215] uppercase">{ORDER_STATUS_LABELS[status]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65625D]">Amount:</span>
                <span className="font-bold text-[#111215]">{formatCurrency(initialOrder.total_amount)} (Paid UPI)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65625D]">Desk:</span>
                <span className="font-bold text-[#111215]">Ground Floor Counter</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#111215] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-wider py-2.5 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Pass</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const passText = `Kairo Campus Print Pass\nOrder #: ${initialOrder.order_number}\nAmount: ${formatCurrency(initialOrder.total_amount)}\nStatus: ${ORDER_STATUS_LABELS[status]}\nCounter: Ground Floor Printing Desk\nTrack: ${window.location.origin}/orders/${initialOrder.id}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: `Pickup Pass - ${initialOrder.order_number}`,
                          text: passText,
                          url: window.location.href,
                        });
                        return;
                      } catch {}
                    }
                    try {
                      await navigator.clipboard.writeText(passText);
                      setPassCopied(true);
                      setTimeout(() => setPassCopied(false), 2500);
                    } catch {}
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 border border-[#111215] hover:bg-[#FBF9F5] text-[#111215] text-xs font-bold uppercase tracking-wider py-2.5 transition-colors cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{passCopied ? 'Copied!' : 'Share Pass'}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowPassModal(false)}
                className="w-full inline-flex items-center justify-center border border-[#CFC7BB] text-[#65625D] hover:text-[#111215] text-xs font-semibold py-2 hover:bg-[#FBF9F5] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CANCEL ORDER CONFIRMATION ── */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-[#111215]/45 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !cancelling && setShowCancelModal(false)}
        >
          <div
            className="bg-white border-2 border-[#B91C1C] max-w-sm w-full p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-[#B91C1C] font-bold text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>Cancel Print Requisition?</span>
            </div>

            <p className="text-xs text-[#65625D] leading-relaxed">
              Are you sure you want to cancel order <strong>{initialOrder.order_number}</strong>? Since the print shop has not started processing, the requisition will be voided.
            </p>

            {cancelError && (
              <p className="text-xs text-[#B91C1C] bg-red-50 p-2 border border-red-200">
                {cancelError}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#B91C1C] hover:bg-red-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider py-2.5 transition-colors cursor-pointer"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel</span>
                )}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 inline-flex items-center justify-center border border-[#CFC7BB] text-[#111215] text-xs font-bold uppercase tracking-wider py-2.5 hover:bg-[#FBF9F5] transition-colors cursor-pointer"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
