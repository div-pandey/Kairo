'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import { UploadedFile, ColourMode } from '@/types';
import {
  Upload, X, FileText, Image, File, AlertCircle,
  CheckCircle2, Loader2, ArrowRight, ArrowLeft,
  FileSpreadsheet, Printer
} from 'lucide-react';
import { formatFileSize, generateLocalId, MAX_FILE_SIZE, formatCurrency, calculateItemTotal } from '@/lib/utils';
import { MAX_FILES_PER_ORDER, MAX_FILE_SIZE_MB } from '@/lib/constants';
import { useRouter } from 'next/navigation';

function FileIcon({ type, name }: { type: string; name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (type.startsWith('image/')) return <Image className="h-4 w-4 text-[#1D4ED8]" />;
  if (ext === 'pdf') return <FileText className="h-4 w-4 text-[#B91C1C]" />;
  if (ext === 'pptx' || ext === 'ppt') return <FileSpreadsheet className="h-4 w-4 text-[#D97706]" />;
  return <FileText className="h-4 w-4 text-[#111215]" />;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [step, setStep] = useState<'upload' | 'configure' | 'confirm'>('upload');
  const [pricing, setPricing] = useState({ bw: 3, colour: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [globalError, setGlobalError] = useState('');

  // ── Fetch live pricing ──
  useEffect(() => {
    fetch('/api/pricing')
      .then((r) => r.json())
      .then((d) => {
        if (d.bw_price_per_page) {
          setPricing({ bw: d.bw_price_per_page, colour: d.colour_price_per_page });
        }
      })
      .catch(() => {});
  }, []);

  // ── Dropzone ──
  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      setGlobalError('');

      if (rejected.length > 0) {
        const errors = rejected.map((r) => `${r.file.name}: ${r.errors.map((e) => e.message).join(', ')}`);
        setGlobalError(errors.join('\n'));
      }

      if (accepted.length === 0) return;

      const remaining = MAX_FILES_PER_ORDER - files.length;
      if (accepted.length > remaining) {
        setGlobalError(`You can only add ${remaining} more file${remaining === 1 ? '' : 's'} (max ${MAX_FILES_PER_ORDER} per order).`);
        accepted = accepted.slice(0, remaining);
      }

      const newFiles: UploadedFile[] = accepted.map((f) => ({
        id: generateLocalId(),
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadProgress: 0,
        pageCountLoading: true,
        colourMode: 'bw',
        printSide: undefined,
        copies: 1,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      for (const uploadedFile of newFiles) {
        getPageCount(uploadedFile);
      }
    },
    [files.length]
  );

  async function getPageCount(uploadedFile: UploadedFile) {
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);

      const res = await fetch('/api/files/page-count', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                pageCount: data.pageCount ?? undefined,
                pageCountSource: data.source ?? 'estimated',
                pageCountLoading: false,
                pageCountError: data.error ?? undefined,
              }
            : f
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, pageCountLoading: false, pageCountError: 'Could not auto-detect pages' }
            : f
        )
      );
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const updateFile = (id: string, updates: Partial<UploadedFile>) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));

  // ── Calculation ──
  const orderItems = files.map((f) => ({
    file: f,
    pageCount: f.pageCount ?? 0,
    pricePerPage: f.colourMode === 'bw' ? pricing.bw : pricing.colour,
    itemTotal: calculateItemTotal(f.pageCount ?? 0, f.copies, f.colourMode === 'bw' ? pricing.bw : pricing.colour),
  }));

  const grandTotal = orderItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const totalPagesCount = orderItems.reduce((acc, item) => acc + ((item.pageCount || 1) * item.file.copies), 0);
  const allReady = files.length > 0 && files.every((f) => !f.pageCountLoading && (f.pageCount !== undefined || f.pageCountError));
  const hasMissingLayout = files.some((f) => !f.printSide);

  // ── Upload to Supabase ──
  async function uploadFiles(): Promise<UploadedFile[] | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const uploaded: UploadedFile[] = [];

    for (const f of files) {
      const ext = f.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${generateLocalId()}.${ext}`;

      const { error } = await supabase.storage
        .from('print-files')
        .upload(path, f.file, { cacheControl: '3600', upsert: false });

      if (error) {
        setSubmitError(`Failed to upload ${f.name}. Please try again.`);
        return null;
      }

      uploaded.push({ ...f, storagePath: path });
    }

    return uploaded;
  }

  // ── Submit Order ──
  async function handleConfirmOrder() {
    if (files.some((f) => !f.printSide)) {
      setSubmitError('Please choose a print layout for all documents before dispatching.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const uploadedFiles = await uploadFiles();
    if (!uploadedFiles) {
      setSubmitting(false);
      return;
    }

    const orderData = {
      items: uploadedFiles.map((f) => ({
        fileName: f.name,
        filePath: f.storagePath!,
        fileSize: f.size,
        fileType: f.type,
        pageCount: f.pageCount,
        pageCountSource: f.pageCountSource ?? 'manual',
        colourMode: f.colourMode,
        printSide: f.printSide || 'separate_pages',
        copies: f.copies,
        pricePerPage: f.colourMode === 'bw' ? pricing.bw : pricing.colour,
      })),
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    const result = await res.json();

    if (!res.ok) {
      setSubmitError(result.error ?? 'Order submission failed.');
      setSubmitting(false);
      return;
    }

    router.push(`/orders/${result.orderId}?new=1`);
  }

  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-5 sm:pb-6">
        <span className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-wider block mb-1">
          [ REQUISITION FORM / KCC CAMPUS DESK ]
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111215] tracking-tight">
          New Print Order
        </h1>
        <p className="font-mono-code text-xs text-[#65625D] mt-1">
          B&amp;W: ₹{pricing.bw}/pg · Colour: ₹{pricing.colour}/pg · Live verification
        </p>
      </div>

      {/* Step Sequence Tabs */}
      <div className="flex border-b border-[#111215] font-mono-code text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setStep('upload')}
          className={`pb-3 pr-6 border-b-2 -mb-px transition-colors ${
            step === 'upload' ? 'border-[#111215] text-[#111215]' : 'border-transparent text-[#98948C] hover:text-[#111215]'
          }`}
        >
          01. Documents ({files.length})
        </button>
        <button
          disabled={files.length === 0}
          onClick={() => setStep('configure')}
          className={`pb-3 px-4 sm:px-6 border-b-2 -mb-px transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
            step === 'configure' ? 'border-[#111215] text-[#111215]' : 'border-transparent text-[#98948C] hover:text-[#111215]'
          }`}
        >
          02. Print Settings
        </button>
        <button
          disabled={files.length === 0 || hasMissingLayout}
          onClick={() => setStep('confirm')}
          className={`pb-3 px-4 sm:px-6 border-b-2 -mb-px transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
            step === 'confirm' ? 'border-[#111215] text-[#111215]' : 'border-transparent text-[#98948C] hover:text-[#111215]'
          }`}
        >
          03. Review &amp; Confirm
        </button>
      </div>

      {/* ── STEP 1: UPLOAD ── */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`relative border border-dashed p-6 sm:p-10 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-[#1D4ED8] bg-[#F3EFE8]' : 'border-[#CFC7BB] bg-white hover:border-[#111215]'
            }`}
          >
            {/* Corner registration cross marks */}
            <span className="absolute top-2 left-2 text-[10px] font-mono-code text-[#B5ADA0] select-none">+</span>
            <span className="absolute top-2 right-2 text-[10px] font-mono-code text-[#B5ADA0] select-none">+</span>
            <span className="absolute bottom-2 left-2 text-[10px] font-mono-code text-[#B5ADA0] select-none">+</span>
            <span className="absolute bottom-2 right-2 text-[10px] font-mono-code text-[#B5ADA0] select-none">+</span>

            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-6 w-6 text-[#111215]" />
              <div>
                <p className="font-display font-bold text-base text-[#111215]">
                  {isDragActive ? 'Drop documents to attach' : 'Drag & drop files or click to browse'}
                </p>
                <p className="font-mono-code text-xs text-[#65625D] mt-1">
                  PDF, DOCX, PPTX, JPG, PNG (Max {MAX_FILE_SIZE_MB}MB per file · Up to {MAX_FILES_PER_ORDER} files)
                </p>
              </div>
            </div>
          </div>

          {globalError && (
            <div className="p-3 text-xs font-mono-code text-[#B91C1C] bg-red-50 border border-red-200">
              <pre className="whitespace-pre-wrap font-sans">{globalError}</pre>
            </div>
          )}

          {/* Attached files docket */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center font-mono-code text-xs text-[#65625D] pb-1">
                <span>Attached Files ({files.length})</span>
                <span>Status</span>
              </div>

              <div className="bg-white border border-[#D8D1C3] divide-y divide-[#E5DFD5]">
                {files.map((f) => (
                  <div key={f.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileIcon type={f.type} name={f.name} />
                      <div className="min-w-0">
                        <p className="font-mono-code text-xs font-bold text-[#111215] truncate">
                          {f.name}
                        </p>
                        <p className="font-mono-code text-[11px] text-[#65625D]">
                          {formatFileSize(f.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3.5 shrink-0 font-mono-code text-xs border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F0EBE3]">
                      {f.pageCountLoading ? (
                        <span className="inline-flex items-center gap-1.5 text-[#65625D]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Counting...
                        </span>
                      ) : f.pageCount !== undefined ? (
                        <span className="kairo-stamp text-[#15803D] border-[#15803D] bg-green-50/40">
                          {f.pageCount} {f.pageCount === 1 ? 'PAGE' : 'PAGES'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            placeholder="Pages"
                            className="w-16 border border-[#CFC7BB] px-2 py-1 text-xs font-mono-code"
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 0) updateFile(f.id, { pageCount: val, pageCountSource: 'manual' });
                            }}
                          />
                          <span className="text-[10px] text-[#B91C1C]">Enter pages</span>
                        </div>
                      )}

                      <button
                        onClick={() => removeFile(f.id)}
                        className="text-[#98948C] hover:text-[#B91C1C] p-1 cursor-pointer"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  disabled={!allReady || files.some((f) => f.pageCount === undefined && !f.pageCountError)}
                  onClick={() => setStep('configure')}
                  className="inline-flex items-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] disabled:opacity-50 text-[#FBF9F5] font-mono-code text-xs uppercase tracking-wider font-bold py-3.5 px-6 rounded-none transition-colors shadow-sm cursor-pointer"
                >
                  Configure Print Settings
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: CONFIGURE ── */}
      {step === 'configure' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {files.map((f) => {
              const pricePerPage = f.colourMode === 'bw' ? pricing.bw : pricing.colour;
              const total = calculateItemTotal(f.pageCount ?? 0, f.copies, pricePerPage);

              return (
                <div key={f.id} className="bg-white border border-[#D8D1C3] p-5 sm:p-6 space-y-4">
                  {/* File title row */}
                  <div className="flex items-start justify-between gap-4 border-b border-[#E5DFD5] pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileIcon type={f.type} name={f.name} />
                      <span className="font-mono-code text-xs font-bold text-[#111215] truncate">
                        {f.name}
                      </span>
                    </div>
                    <span className="font-mono-code text-xs text-[#65625D] shrink-0">
                      {f.pageCount ?? 1} pages
                    </span>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                    {/* Colour Mode Switcher */}
                    <div>
                      <p className="font-mono-code text-[11px] text-[#65625D] uppercase mb-2">
                        Print Mode
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono-code text-xs">
                        <button
                          type="button"
                          onClick={() => updateFile(f.id, { colourMode: 'bw' })}
                          className={`py-2 px-2 text-center transition-colors cursor-pointer text-xs ${
                            f.colourMode === 'bw'
                              ? 'bg-[#111215] text-[#FBF9F5] border-[#111215] font-bold border'
                              : 'bg-[#FBF9F5] text-[#65625D] border-[#CFC7BB] hover:border-[#111215] border'
                          }`}
                        >
                          B&amp;W (₹{pricing.bw})
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFile(f.id, { colourMode: 'colour' })}
                          className={`py-2 px-2 text-center transition-colors cursor-pointer text-xs ${
                            f.colourMode === 'colour'
                              ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] font-bold border'
                              : 'bg-[#FBF9F5] text-[#65625D] border-[#CFC7BB] hover:border-[#1D4ED8] border'
                          }`}
                        >
                          COLOUR (₹{pricing.colour})
                        </button>
                      </div>
                    </div>

                    {/* Print Layout Switcher */}
                    <div>
                      <label
                        htmlFor={`print-layout-${f.id}`}
                        className="font-mono-code text-[11px] text-[#65625D] uppercase mb-2 block font-bold"
                      >
                        PRINT LAYOUT <span className="text-[#B91C1C]">*</span>
                      </label>
                      <select
                        id={`print-layout-${f.id}`}
                        value={f.printSide || ''}
                        onChange={(e) =>
                          updateFile(f.id, {
                            printSide: (e.target.value as 'separate_pages' | 'both_sides') || undefined,
                          })
                        }
                        className={`w-full border bg-[#FBF9F5] py-2 px-2.5 text-xs font-mono-code text-[#111215] focus:outline-none cursor-pointer transition-colors ${
                          !f.printSide
                            ? 'border-[#B91C1C] ring-1 ring-[#B91C1C]/30 bg-red-50/20'
                            : 'border-[#CFC7BB] focus:border-[#111215]'
                        }`}
                        required
                      >
                        <option value="">Select Layout</option>
                        <option value="separate_pages">1. Separate pages (1-sided)</option>
                        <option value="both_sides">2. Both sides of page (2-sided)</option>
                      </select>
                      {!f.printSide ? (
                        <p className="text-[10px] text-[#B91C1C] font-mono-code mt-1 font-semibold flex items-center gap-1">
                          <span>*</span> Required: Choose print layout
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#65625D] font-mono-code mt-1">
                          {f.printSide === 'both_sides' ? 'Back-to-back duplex' : 'Single-sided sheets'}
                        </p>
                      )}
                    </div>

                    {/* Copies Stepper */}
                    <div>
                      <p className="font-mono-code text-[11px] text-[#65625D] uppercase mb-2">
                        Number of Copies
                      </p>
                      <div className="flex items-center gap-3 font-mono-code">
                        <button
                          type="button"
                          onClick={() => updateFile(f.id, { copies: Math.max(1, f.copies - 1) })}
                          className="h-9 w-9 border border-[#CFC7BB] bg-[#FBF9F5] hover:bg-[#111215] hover:text-white transition-colors flex items-center justify-center font-bold text-sm cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-[#111215]">
                          {f.copies}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateFile(f.id, { copies: Math.min(50, f.copies + 1) })}
                          className="h-9 w-9 border border-[#CFC7BB] bg-[#FBF9F5] hover:bg-[#111215] hover:text-white transition-colors flex items-center justify-center font-bold text-sm cursor-pointer"
                        >
                          +
                        </button>

                        <div className="ml-auto text-right font-mono-code">
                          <p className="text-[10px] text-[#98948C]">Item Subtotal</p>
                          <p className="font-bold text-sm text-[#111215]">{formatCurrency(total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running Order Total Bar */}
          <div className="border border-[#111215] bg-[#111215] text-[#FBF9F5] p-5 flex items-center justify-between font-mono-code">
            <div>
              <p className="text-[11px] text-[#98948C] uppercase tracking-wider">
                Total Requisition Amount
              </p>
              <p className="text-2xl font-black mt-0.5">{formatCurrency(grandTotal)}</p>
            </div>
            <p className="text-xs text-[#98948C]">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3 pt-2">
            {hasMissingLayout && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#B91C1C] font-mono-code text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Print layout is compulsory for all documents. Please select a layout for each file to continue.</span>
              </div>
            )}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <button
                onClick={() => setStep('upload')}
                className="inline-flex items-center justify-center gap-1.5 font-mono-code text-xs text-[#65625D] hover:text-[#111215] py-2.5 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Files
              </button>
              <button
                disabled={hasMissingLayout}
                onClick={() => {
                  if (hasMissingLayout) {
                    setSubmitError('Please choose a print layout for all documents.');
                    return;
                  }
                  setStep('confirm');
                }}
                className="inline-flex items-center justify-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed text-[#FBF9F5] font-mono-code text-xs uppercase tracking-wider font-bold py-3.5 px-6 rounded-none transition-colors shadow-sm cursor-pointer"
              >
                Review &amp; Confirm Requisition
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: REVIEW & CONFIRM (FULL PAGE) ── */}
      {step === 'confirm' && (
        <div className="space-y-6 sm:space-y-7 animate-fade-in">
          
          {/* Requisition Docket Header Box */}
          <div className="border-2 border-[#111215] bg-[#FBF9F5] p-5 sm:p-6 shadow-[4px_4px_0px_#111215] relative">
            <span className="absolute top-2 left-2 text-[10px] font-mono-code text-[#B5ADA0] select-none">+</span>
            <span className="absolute top-2 right-2 text-[10px] font-mono-code text-[#B5ADA0] select-none">+</span>
            <span className="absolute bottom-2 left-2 text-[10px] font-mono-code text-[#B5ADA0] select-none">+</span>
            <span className="absolute bottom-2 right-2 text-[10px] font-mono-code text-[#B5ADA0] select-none">+</span>

            <div className="space-y-1">
              <span className="font-mono-code text-[11px] font-bold uppercase tracking-widest text-[#1D4ED8] block">
                [ FORM REQ-204 · CAMPUS DESK DISPATCH ]
              </span>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#111215] tracking-tight">
                Review &amp; Verify Requisition
              </h2>
              <p className="font-mono-code text-xs text-[#65625D]">
                Please review your print specifications, duplex layouts, and estimated charges before dispatching to the production queue.
              </p>
            </div>
          </div>

          {/* Official Press Advisory Docket */}
          <div className="border border-[#111215] bg-[#F4F0E8] p-4 sm:p-4.5 relative">
            <span className="absolute -top-2.5 left-4 bg-[#111215] text-[#FBF9F5] px-2.5 py-0.5 font-mono-code text-[9px] uppercase tracking-widest font-bold">
              PRESS ADVISORY
            </span>
            <div className="flex items-start gap-3.5 pt-1">
              <Printer className="h-5 w-5 text-[#111215] shrink-0 mt-0.5" />
              <div className="space-y-1 font-mono-code">
                <p className="font-bold text-[#111215] uppercase tracking-wider text-xs">
                  Immediate Hardware Queueing Notice
                </p>
                <p className="text-[#65625D] text-xs leading-relaxed">
                  Upon confirmation, print jobs are routed straight to the high-speed campus production station. Specifications cannot be adjusted after confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Line items list / Requisition Manifest */}
          <div className="border-2 border-[#111215] bg-white shadow-[4px_4px_0px_#111215]">
            <div className="bg-[#111215] text-[#FBF9F5] px-5 py-3 flex items-center justify-between font-mono-code text-xs uppercase font-bold tracking-widest">
              <span className="flex items-center gap-2">
                <span>DOCUMENT SPECIFICATIONS</span>
                <span className="text-[#D5CDBC]">({orderItems.length})</span>
              </span>
              <span>ITEM SUBTOTAL</span>
            </div>

            <div className="divide-y divide-[#E5DFD5]">
              {orderItems.map(({ file: f, pageCount, pricePerPage, itemTotal }) => (
                <div key={f.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-[#FBF9F5] transition-colors">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileIcon type={f.type} name={f.name} />
                      <p className="font-mono-code text-sm font-bold text-[#111215] truncate">
                        {f.name}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono-code text-xs">
                      {/* Colour Mode Badge */}
                      <span className={`px-2.5 py-1 font-bold uppercase tracking-wider border text-[11px] ${
                        f.colourMode === 'colour'
                          ? 'bg-blue-50 text-[#1D4ED8] border-[#1D4ED8]'
                          : 'bg-[#111215] text-[#FBF9F5] border-[#111215]'
                      }`}>
                        {f.colourMode === 'colour' ? 'Colour Print' : 'B&W Print'}
                      </span>

                      {/* Print Layout Badge */}
                      <span className="px-2.5 py-1 font-bold uppercase tracking-wider border border-[#CFC7BB] bg-[#FBF9F5] text-[#111215] text-[11px]">
                        {f.printSide === 'both_sides' ? '2-Sided (Duplex)' : '1-Sided (Separate)'}
                      </span>

                      {/* Copies & Rate */}
                      <span className="text-[#65625D]">
                        {pageCount} pgs × {f.copies} {f.copies === 1 ? 'copy' : 'copies'} · ₹{pricePerPage}/pg
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0EBE3] font-mono-code">
                    <span className="font-bold text-[#111215] text-base sm:text-lg">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Desk Pickup & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-code text-xs">
            <div className="p-4 bg-[#F3EFE8] border-2 border-[#CFC7BB] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#65625D] tracking-wider block">Pickup Counter</span>
              <span className="font-bold text-[#111215] text-sm">KCC Campus Print Desk · Ground Floor</span>
            </div>
            <div className="p-4 bg-[#F3EFE8] border-2 border-[#CFC7BB] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#65625D] tracking-wider block">Payment Instructions</span>
              <span className="font-bold text-[#111215] text-sm">UPI QR Code or Cash at Desk</span>
            </div>
          </div>

          {/* Grand total banner */}
          <div className="border-2 border-[#111215] bg-[#111215] text-[#FBF9F5] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono-code shadow-[4px_4px_0px_#111215]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#D5CDBC] block">
                Total Amount Due at Desk
              </span>
              <span className="text-xs text-[#98948C]">
                {totalPagesCount} total page{totalPagesCount === 1 ? '' : 's'} across {orderItems.length} file{orderItems.length === 1 ? '' : 's'} · Live press verification
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {submitError && (
            <div className="p-4 text-xs text-[#B91C1C] bg-red-50 border-2 border-[#B91C1C] font-mono-code flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={() => setStep('configure')}
              disabled={submitting}
              className="w-full sm:w-1/3 border-2 border-[#111215] bg-white hover:bg-[#F3EFE8] text-[#111215] py-4 px-5 font-mono-code text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Modify Settings</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={submitting}
              className="w-full sm:w-2/3 bg-[#111215] hover:bg-[#15803D] disabled:opacity-50 text-[#FBF9F5] py-4 px-6 font-mono-code text-xs uppercase tracking-wider font-bold transition-all shadow-[4px_4px_0px_#15803D] cursor-pointer flex items-center justify-center gap-2.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting to Press...</span>
                </>
              ) : (
                <>
                  <span>Confirm &amp; Dispatch Print</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
