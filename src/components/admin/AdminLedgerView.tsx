'use client';

import { useState, useMemo } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, Download, Search, Calendar, FileSpreadsheet, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import Link from 'next/link';

interface OrderItemData {
  id: string;
  file_name: string;
  page_count?: number;
  colour_mode: 'bw' | 'colour';
  print_side?: 'separate_pages' | 'both_sides';
  page_range?: string;
  copies: number;
  item_total: number;
}

interface ProfileData {
  full_name: string;
  kcc_id: string;
  class_name: string;
  year: string;
  section: string;
  phone_number?: string;
}

export interface LedgerOrder {
  id: string;
  order_number: string;
  student_id: string;
  status: 'pending' | 'accepted' | 'printing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  created_at: string;
  profiles?: ProfileData | null;
  order_items?: OrderItemData[];
}

interface Props {
  initialOrders: LedgerOrder[];
}

export function AdminLedgerView({ initialOrders }: Props) {
  const [selectedRange, setSelectedRange] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom' | 'all'>('today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Date filtering logic
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return initialOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      const orderDateStr = order.created_at.split('T')[0];

      // Time range check
      if (selectedRange === 'today' && orderDateStr !== todayStr) return false;
      if (selectedRange === 'yesterday' && orderDateStr !== yesterdayStr) return false;
      if (selectedRange === 'week' && orderDate < sevenDaysAgo) return false;
      if (selectedRange === 'month' && orderDate < thirtyDaysAgo) return false;
      if (selectedRange === 'custom' && orderDateStr !== customDate) return false;

      // Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.order_number.toLowerCase().includes(q);
        const matchesName = order.profiles?.full_name?.toLowerCase().includes(q);
        const matchesRoll = order.profiles?.kcc_id?.toLowerCase().includes(q);
        const matchesClass = order.profiles?.class_name?.toLowerCase().includes(q);
        if (!matchesNumber && !matchesName && !matchesRoll && !matchesClass) {
          return false;
        }
      }

      return true;
    });
  }, [initialOrders, selectedRange, customDate, searchQuery]);

  // Calculations for paper consumption & financial metrics
  const summary = useMemo(() => {
    let grossRevenue = 0;
    let completedRevenue = 0;
    let pendingRevenue = 0;
    let totalCompleted = 0;
    let totalPending = 0;
    let totalCancelled = 0;
    let totalBwImpressions = 0;
    let totalColourImpressions = 0;
    let totalPhysicalSheets = 0;

    filteredOrders.forEach((order) => {
      const isCancelled = order.status === 'cancelled';
      const isCompleted = order.status === 'completed';

      if (!isCancelled) {
        grossRevenue += order.total_amount || 0;
        if (isCompleted) {
          completedRevenue += order.total_amount || 0;
        } else {
          pendingRevenue += order.total_amount || 0;
        }
      }

      if (isCompleted) totalCompleted++;
      else if (isCancelled) totalCancelled++;
      else totalPending++;

      // Tally paper & ink if not cancelled
      if (!isCancelled && order.order_items) {
        order.order_items.forEach((item) => {
          const pages = item.page_count || 1;
          const copies = item.copies || 1;
          const totalImp = pages * copies;

          if (item.colour_mode === 'colour') {
            totalColourImpressions += totalImp;
          } else {
            totalBwImpressions += totalImp;
          }

          // Duplex saves sheets: 2 pages per 1 sheet
          if (item.print_side === 'both_sides') {
            totalPhysicalSheets += Math.ceil(pages / 2) * copies;
          } else {
            totalPhysicalSheets += pages * copies;
          }
        });
      }
    });

    const reamsUsed = (totalPhysicalSheets / 500).toFixed(2);

    return {
      totalOrders: filteredOrders.length,
      grossRevenue,
      completedRevenue,
      pendingRevenue,
      totalCompleted,
      totalPending,
      totalCancelled,
      totalBwImpressions,
      totalColourImpressions,
      totalPhysicalSheets,
      reamsUsed,
    };
  }, [filteredOrders]);

  // Export to CSV spreadsheet
  const handleExportCSV = () => {
    const headers = [
      'Order Number',
      'Date & Time',
      'Student Name',
      'Roll / KCC ID',
      'Class & Year',
      'Phone Number',
      'Status',
      'Items Count',
      'Page Range / Details',
      'Paper Sheets Used',
      'Total Amount (INR)',
      'Special Instructions'
    ];

    const rows = filteredOrders.map((order) => {
      const itemsDetail = (order.order_items || [])
        .map((it) => `${it.file_name} (${it.colour_mode.toUpperCase()}, ${it.copies}x, Pages: ${it.page_range || 'all'})`)
        .join(' | ');

      const sheets = (order.order_items || []).reduce((acc, it) => {
        const pages = it.page_count || 1;
        const copies = it.copies || 1;
        return acc + (it.print_side === 'both_sides' ? Math.ceil(pages / 2) * copies : pages * copies);
      }, 0);

      return [
        `"${order.order_number}"`,
        `"${formatDate(order.created_at)}"`,
        `"${order.profiles?.full_name || 'N/A'}"`,
        `"${order.profiles?.kcc_id || 'N/A'}"`,
        `"${order.profiles?.class_name || ''} Y${order.profiles?.year || ''}-${order.profiles?.section || ''}"`,
        `"${order.profiles?.phone_number || ''}"`,
        `"${order.status.toUpperCase()}"`,
        order.order_items?.length || 0,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        sheets,
        order.total_amount,
        `"${(order.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kairo_ledger_${selectedRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-mono-code">
      {/* Top Controls (Hidden during print) */}
      <div className="print:hidden space-y-4">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DFD5] pb-4">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#65625D] mr-1 uppercase text-[10px] tracking-wider font-bold">
              Period:
            </span>
            {(['today', 'yesterday', 'week', 'month', 'custom', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1.5 border text-xs font-bold uppercase transition-colors cursor-pointer ${
                  selectedRange === r
                    ? 'bg-[#111215] text-white border-[#111215]'
                    : 'bg-white text-[#65625D] border-[#D8D1C3] hover:border-[#111215] hover:text-[#111215]'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'yesterday' ? 'Yesterday' : r === 'week' ? 'Last 7 Days' : r === 'month' ? '30 Days' : r === 'custom' ? 'Pick Date' : 'All Time'}
              </button>
            ))}

            {selectedRange === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="bg-white border border-[#111215] px-2 py-1 text-xs text-[#111215] focus:outline-hidden"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#D8D1C3] bg-white hover:border-[#111215] text-[#111215] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Download structured spreadsheet for audit records"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-green-700" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#111215] hover:bg-[#1D4ED8] text-white font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Print formal reconciliation sheet"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Reconciliation</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#98948C]" />
          <input
            type="text"
            placeholder="Filter records by student name, roll number, order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#D8D1C3] bg-white text-xs text-[#111215] placeholder-[#98948C] focus:outline-hidden focus:border-[#111215]"
          />
        </div>
      </div>

      {/* Printable Official Header (Shows cleanly in print) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider">KAIRO CAMPUS PRINT DESK</h1>
            <p className="text-xs uppercase font-bold text-gray-700">Daily Cash &amp; Paper Consumption Reconciliation Ledger</p>
            <p className="text-[11px] text-gray-600 mt-1">KCC Institute of Technology &amp; Management · Greater Noida</p>
          </div>
          <div className="text-right text-xs">
            <p><strong>Period:</strong> {selectedRange.toUpperCase()} {selectedRange === 'custom' ? `(${customDate})` : ''}</p>
            <p><strong>Generated:</strong> {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards / Audit Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 border-y border-[#111215] py-4 bg-white print:bg-transparent print:border-black">
        <div className="p-3 border-r border-[#E5DFD5] last:border-r-0">
          <span className="text-[10px] text-[#65625D] uppercase block font-bold">Gross Revenue</span>
          <p className="text-xl sm:text-2xl font-black text-[#111215] mt-1">{formatCurrency(summary.grossRevenue)}</p>
          <span className="text-[10px] text-green-700 font-bold block mt-0.5">
            Collected: {formatCurrency(summary.completedRevenue)}
          </span>
        </div>

        <div className="p-3 border-r border-[#E5DFD5] last:border-r-0">
          <span className="text-[10px] text-[#65625D] uppercase block font-bold">Requisitions</span>
          <p className="text-xl sm:text-2xl font-black text-[#111215] mt-1">{summary.totalOrders}</p>
          <span className="text-[10px] text-[#65625D] block mt-0.5">
            {summary.totalCompleted} done · {summary.totalPending} pending
          </span>
        </div>

        <div className="p-3 border-r border-[#E5DFD5] last:border-r-0">
          <span className="text-[10px] text-[#65625D] uppercase block font-bold">A4 Sheets Consumed</span>
          <p className="text-xl sm:text-2xl font-black text-[#1D4ED8] mt-1">{summary.totalPhysicalSheets.toLocaleString()}</p>
          <span className="text-[10px] text-[#65625D] block mt-0.5">
            ≈ {summary.reamsUsed} reams (500/ream)
          </span>
        </div>

        <div className="p-3 border-r border-[#E5DFD5] last:border-r-0">
          <span className="text-[10px] text-[#65625D] uppercase block font-bold">B&amp;W Impressions</span>
          <p className="text-xl sm:text-2xl font-black text-[#111215] mt-1">{summary.totalBwImpressions.toLocaleString()}</p>
          <span className="text-[10px] text-[#65625D] block mt-0.5">Standard Toner</span>
        </div>

        <div className="p-3 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[#65625D] uppercase block font-bold">Colour Impressions</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{summary.totalColourImpressions.toLocaleString()}</p>
          <span className="text-[10px] text-[#65625D] block mt-0.5">Colour Press</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-[#D8D1C3] print:border-black">
        <div className="px-5 py-3.5 border-b border-[#E5DFD5] bg-[#F5F1EA] flex justify-between items-center print:bg-gray-100 print:border-black">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#111215]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[#111215]">
              Itemized Audit Register ({filteredOrders.length} records)
            </span>
          </div>
          <span className="text-[11px] text-[#65625D] print:text-black">
            KCC Campus Print Operations
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-[#65625D]">
            <p className="font-bold text-sm text-[#111215]">No orders recorded for this period</p>
            <p className="text-xs mt-1">Adjust the date range above to view historical ledgers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5DFD5] bg-[#FBF9F5] text-[10px] text-[#65625D] uppercase print:bg-gray-100 print:border-black print:text-black">
                  <th className="py-2.5 px-3 font-bold">Time / Order #</th>
                  <th className="py-2.5 px-3 font-bold">Student Dossier</th>
                  <th className="py-2.5 px-3 font-bold">Requisition Details</th>
                  <th className="py-2.5 px-3 font-bold text-center">Sheets</th>
                  <th className="py-2.5 px-3 font-bold text-center">Status</th>
                  <th className="py-2.5 px-3 font-bold text-right">Fee (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5] print:divide-black">
                {filteredOrders.map((order) => {
                  const sheets = (order.order_items || []).reduce((acc, it) => {
                    const pages = it.page_count || 1;
                    const copies = it.copies || 1;
                    return acc + (it.print_side === 'both_sides' ? Math.ceil(pages / 2) * copies : pages * copies);
                  }, 0);

                  return (
                    <tr key={order.id} className="hover:bg-[#FBF9F5] print:hover:bg-transparent">
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-[#111215] hover:text-[#1D4ED8] block print:no-underline"
                        >
                          {order.order_number}
                        </Link>
                        <span className="text-[10px] text-[#65625D] block mt-0.5">
                          {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top">
                        <p className="font-bold text-[#111215]">{order.profiles?.full_name || 'Guest'}</p>
                        <p className="text-[10px] text-[#65625D]">
                          Roll: <strong className="text-[#111215]">{order.profiles?.kcc_id || 'N/A'}</strong> · {order.profiles?.class_name || ''}
                        </p>
                      </td>

                      <td className="py-3 px-3 align-top">
                        <div className="space-y-1">
                          {order.order_items?.map((it, idx) => (
                            <div key={it.id || idx} className="text-[11px] text-[#111215]">
                              <span className="truncate max-w-[200px] inline-block font-semibold">
                                {it.file_name}
                              </span>
                              <span className="text-[#65625D] ml-1.5 text-[10px]">
                                [{it.colour_mode === 'colour' ? 'COLOUR' : 'B&W'}, {it.print_side === 'both_sides' ? 'DUPLEX' : 'SINGLE'}, {it.copies}x
                                {it.page_range && it.page_range !== 'all' ? ` · R:${it.page_range}` : ''}]
                              </span>
                            </div>
                          ))}
                          {order.notes && (
                            <p className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 mt-1 inline-block">
                              Note: {order.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top text-center font-bold text-[#111215]">
                        {sheets}
                      </td>

                      <td className="py-3 px-3 align-top text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold border ${
                            order.status === 'completed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : order.status === 'cancelled'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top text-right font-black text-sm text-[#111215]">
                        {formatCurrency(order.total_amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black bg-[#F5F1EA] font-bold print:bg-gray-100">
                  <td colSpan={3} className="py-3 px-3 text-xs uppercase">
                    Reconciliation Total ({filteredOrders.length} requisitions)
                  </td>
                  <td className="py-3 px-3 text-center text-xs text-[#1D4ED8] font-black">
                    {summary.totalPhysicalSheets} sheets
                  </td>
                  <td></td>
                  <td className="py-3 px-3 text-right text-base text-[#111215] font-black">
                    {formatCurrency(summary.grossRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* End-of-Day Physical Sign-Off Block (Appears only on print / audit sheet) */}
      <div className="hidden print:block pt-8 text-xs font-mono-code text-black">
        <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-black">
          <div className="space-y-12">
            <p className="font-bold uppercase text-[10px]">1. Desk Operator In-Charge</p>
            <div className="border-t border-black pt-1">
              <p>Signature &amp; Date</p>
            </div>
          </div>

          <div className="space-y-12">
            <p className="font-bold uppercase text-[10px]">2. Physical Cash Verified By</p>
            <div className="border-t border-black pt-1">
              <p>Accounts Officer Stamp</p>
            </div>
          </div>

          <div className="space-y-12">
            <p className="font-bold uppercase text-[10px]">3. Audit Clearance</p>
            <div className="border-t border-black pt-1">
              <p>Campus Admin Signature</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border border-black p-3 text-[10px] space-y-1">
          <p className="font-bold uppercase">Cashier Remarks &amp; Paper Inventory Discrepancy Note:</p>
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}
