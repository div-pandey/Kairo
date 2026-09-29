'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, ArrowRight, FileText, X, Filter } from 'lucide-react';

interface Props {
  initialOrders: (Order & { profiles?: any; order_items?: any[] })[];
}

type FilterTab = 'all' | OrderStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All Jobs' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'printing', label: 'Printing' },
  { id: 'ready', label: 'Ready for Pickup' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function AdminOrdersQueue({ initialOrders }: Props) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Count per tab
  const counts = useMemo(() => {
    const map: Record<FilterTab, number> = {
      all: initialOrders.length,
      pending: 0,
      accepted: 0,
      printing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const o of initialOrders) {
      if (o.status && map[o.status] !== undefined) {
        map[o.status]++;
      }
    }
    return map;
  }, [initialOrders]);

  // Filtered orders based on search and tab
  const filteredOrders = useMemo(() => {
    return initialOrders.filter((o) => {
      // 1. Tab filter
      if (activeTab !== 'all' && o.status !== activeTab) {
        return false;
      }

      // 2. Search query filter
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const num = o.order_number?.toLowerCase() || '';
        const name = o.profiles?.full_name?.toLowerCase() || '';
        const roll = o.profiles?.kcc_id?.toLowerCase() || '';
        const cls = o.profiles?.class_name?.toLowerCase() || '';
        const room = o.profiles?.room_number?.toLowerCase() || '';
        return num.includes(q) || name.includes(q) || roll.includes(q) || cls.includes(q) || room.includes(q);
      }

      return true;
    });
  }, [initialOrders, activeTab, search]);

  return (
    <div className="space-y-5 font-mono-code">
      
      {/* Search Bar & Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#65625D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number (2504...), order # (KAI-1234)..."
            className="w-full bg-white border border-[#CFC7BB] focus:border-[#111215] text-xs px-10 py-3 outline-none text-[#111215] placeholder:text-[#98948C] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#98948C] hover:text-[#111215]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {search && (
          <div className="flex items-center text-xs text-[#65625D] px-2 self-center">
            Found {filteredOrders.length} match{filteredOrders.length === 1 ? '' : 'es'}
          </div>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {TABS.map((tab) => {
          const count = counts[tab.id];
          const isSelected = activeTab === tab.id;
          const isPendingHighlight = tab.id === 'pending' && count > 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 border uppercase tracking-wider text-[11px] shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? 'border-[#111215] bg-[#111215] text-[#FBF9F5] font-bold shadow-xs'
                  : 'border-[#CFC7BB] bg-white text-[#65625D] hover:border-[#111215] hover:text-[#111215]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  isSelected
                    ? 'bg-white text-[#111215]'
                    : isPendingHighlight
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-[#F3EFE8] text-[#65625D]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-[#D8D1C3]">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-[#65625D] space-y-2">
            <FileText className="h-8 w-8 mx-auto text-[#98948C] mb-2" />
            <p className="font-bold text-sm text-[#111215]">No matching requisitions</p>
            <p className="text-xs text-[#65625D]">
              {search
                ? `No orders found matching "${search}". Try adjusting your search query.`
                : `No orders currently in "${ORDER_STATUS_LABELS[activeTab as OrderStatus] || activeTab}" status.`}
            </p>
            {(search || activeTab !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setActiveTab('all');
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#1D4ED8] hover:underline font-bold"
              >
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="divide-y divide-[#E5DFD5] md:hidden">
              {filteredOrders.map((order) => {
                const profile = order.profiles;
                const fileCount = order.order_items?.length || 1;
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
                        {formatDate(order.created_at)} · {fileCount} file{fileCount === 1 ? '' : 's'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE3]">
                      <span className="font-bold text-base text-[#111215]">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <span>Inspect &amp; Print</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Ledger Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#111215] bg-[#F5F1EA] text-[#111215] uppercase text-[10px] tracking-wider">
                    <th className="text-left px-5 py-3.5 font-bold">Order ID</th>
                    <th className="text-left px-5 py-3.5 font-bold">Student Record</th>
                    <th className="text-left px-5 py-3.5 font-bold">Files &amp; Pages</th>
                    <th className="text-left px-5 py-3.5 font-bold">Submitted</th>
                    <th className="text-left px-5 py-3.5 font-bold">Total</th>
                    <th className="text-left px-5 py-3.5 font-bold">Status</th>
                    <th className="text-right px-5 py-3.5 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {filteredOrders.map((order) => {
                    const profile = order.profiles;
                    const items = order.order_items || [];
                    const totalPages = items.reduce((acc, i) => acc + ((i.page_count || 1) * (i.copies || 1)), 0);

                    return (
                      <tr key={order.id} className="hover:bg-[#FBF9F5] transition-colors">
                        <td className="px-5 py-4 font-bold text-[#111215] whitespace-nowrap">
                          {order.order_number}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#111215]">{profile?.full_name}</p>
                          <p className="text-[11px] text-[#65625D]">
                            Roll: <strong>{profile?.kcc_id}</strong> · {profile?.class_name} {profile?.room_number ? `(${profile.room_number})` : ''}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-[#65625D] text-[11px] whitespace-nowrap">
                          {items.length} {items.length === 1 ? 'doc' : 'docs'} · {totalPages} pgs
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111215] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="h-3 w-3" />
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
