'use client';

import { OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STAMP_STYLES: Record<OrderStatus, string> = {
  pending: 'border-[#B45309] text-[#B45309] bg-amber-50/60',
  accepted: 'border-[#1D4ED8] text-[#1D4ED8] bg-blue-50/60',
  printing: 'border-[#6D28D9] text-[#6D28D9] bg-purple-50/60',
  ready: 'border-[#15803D] text-[#15803D] bg-green-50/60 font-bold',
  completed: 'border-[#65625D] text-[#65625D] bg-[#F3EFE8]',
  cancelled: 'border-[#B91C1C] text-[#B91C1C] bg-red-50/60',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono-code text-[11px] uppercase tracking-wider px-2 py-0.5 border rounded-none font-semibold transition-colors',
        STAMP_STYLES[status] || 'border-[#CFC7BB] text-[#65625D]',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-[#B45309]': status === 'pending',
        'bg-[#1D4ED8]': status === 'accepted',
        'bg-[#6D28D9]': status === 'printing',
        'bg-[#15803D]': status === 'ready',
        'bg-[#65625D]': status === 'completed',
        'bg-[#B91C1C]': status === 'cancelled',
      })} />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
