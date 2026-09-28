'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { CheckCircle2, Printer, PackageCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

const NEXT_STATUS_MAP: Partial<Record<OrderStatus, { next: OrderStatus; label: string; icon: any }>> = {
  pending: { next: 'accepted', label: 'Accept Print Order', icon: CheckCircle2 },
  accepted: { next: 'printing', label: 'Send to Press Machine', icon: Printer },
  printing: { next: 'ready', label: 'Mark Ready at Campus Desk', icon: PackageCheck },
  ready: { next: 'completed', label: 'Mark Handed Over to Student', icon: CheckCircle2 },
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'accepted', 'printing', 'ready', 'completed', 'cancelled'];

export function AdminStatusChanger({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const nextStep = NEXT_STATUS_MAP[status];

  async function updateStatus(newStatus: OrderStatus) {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      setStatus(newStatus);
      setSuccessMsg(`Status updated to "${ORDER_STATUS_LABELS[newStatus]}"`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-[#D8D1C3] p-5 space-y-4 font-mono-code text-xs">
      <div className="border-b border-[#E5DFD5] pb-3">
        <h3 className="font-bold text-[#111215] uppercase tracking-wider text-xs">Update Status</h3>
        <p className="text-[11px] text-[#65625D] mt-0.5">Control print lifecycle &amp; notify student</p>
      </div>

      {error && (
        <div className="p-2.5 text-[11px] text-[#B91C1C] bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-2.5 text-[11px] text-[#15803D] bg-green-50 border border-green-200">
          {successMsg}
        </div>
      )}

      {/* Primary Next Action */}
      {nextStep && status !== 'completed' && status !== 'cancelled' && (
        <div>
          <button
            onClick={() => updateStatus(nextStep.next)}
            disabled={loading}
            className="w-full flex items-center justify-between bg-[#111215] hover:bg-[#1D4ED8] text-white font-bold py-3 px-4 transition-colors cursor-pointer disabled:opacity-50 uppercase tracking-wider text-xs"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...
              </span>
            ) : (
              <>
                <span>{nextStep.label}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Manual Status Buttons */}
      <div className="pt-2 border-t border-[#E5DFD5]">
        <label className="block text-[10px] uppercase tracking-wider text-[#65625D] mb-2 font-bold">
          Manual Status Override
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_STATUSES.map((s) => {
            const isSelected = status === s;
            return (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={loading || isSelected}
                className={`text-[10px] px-2.5 py-1.5 border uppercase tracking-wider transition-colors text-left flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#111215] bg-[#111215] text-white font-bold'
                    : 'border-[#CFC7BB] bg-[#FBF9F5] text-[#65625D] hover:border-[#111215] hover:text-[#111215]'
                } disabled:cursor-not-allowed`}
              >
                <span>{ORDER_STATUS_LABELS[s]}</span>
                {isSelected && <span className="h-1 w-1 rounded-full bg-white shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
