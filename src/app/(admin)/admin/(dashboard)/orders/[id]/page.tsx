import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Order } from '@/types';
import { formatCurrency, formatDate, formatFileSize } from '@/lib/utils';
import { ArrowLeft, FileText, Download, User } from 'lucide-react';
import { AdminStatusChanger } from '@/components/admin/AdminStatusChanger';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(*)')
    .eq('id', id)
    .single();

  if (!order) notFound();

  const profile = (order as any).profiles;

  return (
    <div className="px-4 py-6 sm:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in font-mono-code">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[#65625D] hover:text-[#111215] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to print queue
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-[#111215] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="text-[10px] text-[#65625D] uppercase tracking-wider block mb-1">
            KAIRO DESK / JOB INSPECTION
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#111215] tracking-tight">
            {(order as Order).order_number}
          </h1>
          <p className="text-xs text-[#65625D] mt-1">
            Submitted: {formatDate(order.created_at)}
          </p>
        </div>

        <div className="sm:text-right shrink-0">
          <StatusBadge status={order.status} />
          <p className="text-2xl font-black text-[#111215] mt-2">
            {formatCurrency(order.total_amount)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Files to print & download */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#D8D1C3]">
            <div className="px-5 py-3.5 border-b border-[#E5DFD5] bg-[#F5F1EA] flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider text-[#111215]">
                Files to Print ({order.order_items?.length ?? 0})
              </span>
              <span className="text-[11px] text-[#65625D]">Ready for press</span>
            </div>

            <div className="divide-y divide-[#E5DFD5]">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#111215]" />
                        <span className="font-bold text-xs text-[#111215] truncate">
                          {item.file_name}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#65625D]">
                        {formatFileSize(item.file_size)} · {item.page_count ?? '?'} pages
                      </p>
                    </div>

                    <AdminFileDownload filePath={item.file_path} fileName={item.file_name} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#FBF9F5] border border-[#E5DFD5] p-3 text-[11px] text-[#65625D]">
                    <div>Mode: <strong className="text-[#111215] uppercase">{item.colour_mode === 'bw' ? 'B&W' : 'Colour'}</strong></div>
                    <div>Copies: <strong className="text-[#111215]">{item.copies}</strong></div>
                    <div>Subtotal: <strong className="text-[#111215]">{formatCurrency(item.item_total)}</strong></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F5F1EA] border-t border-[#E5DFD5] flex justify-between text-xs font-bold">
              <span>Total Requisition Fee</span>
              <span className="text-base text-[#111215]">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Right: Student Record & Status Changer */}
        <div className="space-y-6">
          {/* Student Dossier */}
          <div className="bg-white border border-[#D8D1C3] p-5 space-y-3">
            <div className="border-b border-[#E5DFD5] pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-[#65625D]" />
              <span className="font-bold text-xs uppercase tracking-wider text-[#111215]">
                Student Record
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#65625D]">Name</span>
                <span className="font-bold text-[#111215]">{profile?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65625D]">KCC ID</span>
                <span className="font-bold text-[#111215]">{profile?.kcc_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65625D]">Class</span>
                <span className="text-[#111215]">{profile?.class_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65625D]">Year/Sec</span>
                <span className="text-[#111215]">{profile?.year} · Sec {profile?.section}</span>
              </div>
              {profile?.phone_number && (
                <div className="flex justify-between">
                  <span className="text-[#65625D]">Mobile</span>
                  <span className="font-bold text-[#111215]">{profile.phone_number}</span>
                </div>
              )}
              {profile?.room_number && (
                <div className="flex justify-between">
                  <span className="text-[#65625D]">Classroom</span>
                  <span className="text-[#111215]">{profile?.room_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Changer */}
          <AdminStatusChanger orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
    </div>
  );
}

async function AdminFileDownload({ filePath, fileName }: { filePath: string; fileName: string }) {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from('print-files')
    .createSignedUrl(filePath, 3600);

  if (!data?.signedUrl) {
    return <span className="text-[11px] text-[#B91C1C]">File unavailable</span>;
  }

  return (
    <a
      href={data.signedUrl}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs bg-[#111215] hover:bg-[#1D4ED8] text-white px-3 py-1.5 transition-colors font-bold uppercase tracking-wider"
    >
      <Download className="h-3.5 w-3.5" />
      <span>Download</span>
    </a>
  );
}
