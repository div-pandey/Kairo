'use client';

import { useState } from 'react';
import { Printer, Check, Copy } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  order: any;
  profile: any;
}

export function AdminPrintJobSlip({ order, profile }: Props) {
  const [copied, setCopied] = useState(false);

  const handlePrintSlip = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = [
      `ORDER: ${order.order_number}`,
      `STUDENT: ${profile?.full_name} (${profile?.kcc_id})`,
      `CLASS: ${profile?.class_name} · Year ${profile?.year}-${profile?.section}`,
      profile?.phone_number ? `PHONE: ${profile.phone_number}` : null,
      `AMOUNT: ₹${order.total_amount}`,
      order.notes ? `NOTE: "${order.notes}"` : null,
      `FILES:`,
      ...(order.order_items || []).map((it: any, idx: number) => 
        `  ${idx + 1}. ${it.file_name} [${it.colour_mode.toUpperCase()}, ${it.print_side === 'both_sides' ? 'DUPLEX' : 'SINGLE'}, ${it.copies}x, Pages: ${it.page_range || 'ALL'}]`
      ),
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrintSlip}
        className="inline-flex items-center gap-1.5 text-xs bg-[#111215] hover:bg-[#1D4ED8] text-white px-3 py-2 transition-colors font-bold uppercase tracking-wider cursor-pointer"
        title="Print physical desk job slip / counter tag"
      >
        <Printer className="h-3.5 w-3.5" />
        <span>Print Job Slip</span>
      </button>

      <button
        onClick={handleCopySummary}
        className="inline-flex items-center gap-1.5 text-xs border border-[#D8D1C3] bg-white hover:border-[#111215] text-[#111215] px-3 py-2 transition-colors font-bold uppercase tracking-wider cursor-pointer"
        title="Copy quick summary to clipboard"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-600" />
            <span className="text-green-600">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-[#65625D]" />
            <span>Copy Info</span>
          </>
        )}
      </button>

      {/* Hidden printable receipt slip, rendered only during window.print() */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-6 font-mono-code text-black text-xs">
        <div className="max-w-xs mx-auto border-2 border-black p-4 space-y-3">
          <div className="text-center border-b border-black pb-2">
            <h2 className="font-bold text-base tracking-widest uppercase">KAIRO CAMPUS PRESS</h2>
            <p className="text-[10px]">KCC ITM DESK DISPATCH SLIP</p>
          </div>

          <div className="space-y-1 text-[11px] border-b border-black pb-2">
            <div className="flex justify-between">
              <span>JOB ID:</span>
              <span className="font-black text-sm">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>STUDENT:</span>
              <span className="font-bold">{profile?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span>ROLL / ID:</span>
              <span className="font-bold">{profile?.kcc_id}</span>
            </div>
            <div className="flex justify-between">
              <span>CLASS/SEC:</span>
              <span>{profile?.class_name} ({profile?.year}-{profile?.section})</span>
            </div>
            {profile?.phone_number && (
              <div className="flex justify-between">
                <span>MOBILE:</span>
                <span>{profile.phone_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>DATE:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="border border-black p-2 bg-gray-50 text-[10px]">
              <span className="font-bold block uppercase">Instructions:</span>
              <p className="font-bold">{order.notes}</p>
            </div>
          )}

          <div className="space-y-2 border-b border-black pb-2">
            <span className="font-bold text-[10px] uppercase block">Documents to Print:</span>
            {order.order_items?.map((item: any, i: number) => (
              <div key={item.id || i} className="text-[10px] border-t border-dashed border-gray-400 pt-1">
                <div className="font-bold truncate">{i + 1}. {item.file_name}</div>
                <div className="flex justify-between text-gray-700">
                  <span>{item.colour_mode === 'bw' ? 'B&W' : 'COLOUR'} · {item.print_side === 'both_sides' ? 'DUPLEX' : 'SINGLE'}</span>
                  <span>{item.copies} copies</span>
                </div>
                {item.page_range && item.page_range !== 'all' && (
                  <div className="font-black text-black">
                    *** PRINT PAGES: {item.page_range} ***
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="font-bold text-xs uppercase">TOTAL CHARGES:</span>
            <span className="font-black text-lg">{formatCurrency(order.total_amount)}</span>
          </div>

          <div className="text-center pt-3 border-t border-dashed border-gray-400 text-[9px] text-gray-600">
            Keep this slip with the printed packet at the pickup tray.
          </div>
        </div>
      </div>
    </div>
  );
}
