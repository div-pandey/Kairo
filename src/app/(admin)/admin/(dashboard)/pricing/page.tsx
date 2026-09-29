'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, Calculator, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminPricingPage() {
  const router = useRouter();
  const [bwPrice, setBwPrice] = useState<number>(3);
  const [colourPrice, setColourPrice] = useState<number>(5);
  const [initialRates, setInitialRates] = useState<{ bw: number; colour: number }>({ bw: 3, colour: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Fetch current pricing ──
  useEffect(() => {
    fetch('/api/pricing')
      .then((r) => r.json())
      .then((d) => {
        if (d.bw_price_per_page && d.colour_price_per_page) {
          setBwPrice(Number(d.bw_price_per_page));
          setColourPrice(Number(d.colour_price_per_page));
          setInitialRates({
            bw: Number(d.bw_price_per_page),
            colour: Number(d.colour_price_per_page),
          });
        }
      })
      .catch(() => setError('Could not load current pricing'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveRates(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bw_price_per_page: bwPrice,
          colour_price_per_page: colourPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update rates');
      }

      setInitialRates({ bw: bwPrice, colour: colourPrice });
      setSuccess(`Pricing updated successfully: B&W ₹${bwPrice}/pg · Colour ₹${colourPrice}/pg`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save rate configuration');
    } finally {
      setSaving(false);
    }
  }

  const isChanged = bwPrice !== initialRates.bw || colourPrice !== initialRates.colour;

  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in font-mono-code">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-[#65625D] uppercase tracking-wider block mb-1">
            [ KAIRO DESK / FINANCIAL CONTROL ]
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111215] tracking-tight">
            Rate Configuration
          </h1>
          <p className="text-xs text-[#65625D] mt-1">
            Manage per-page charges applied across all campus print jobs
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F3EFE8] px-3 py-1.5 border border-[#CFC7BB] text-[11px] text-[#111215] self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-[#15803D]" />
          <span>Active Desk Rates</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-[#D8D1C3] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-3 w-28" />
                  <div className="flex gap-2">
                    <Skeleton className="h-11 flex-1" />
                    <Skeleton className="h-11 w-11 shrink-0" />
                    <Skeleton className="h-11 w-11 shrink-0" />
                  </div>
                </div>
                <Skeleton className="h-7 w-52" />
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#D8D1C3] p-6 space-y-4">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveRates} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#B91C1C] text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-[#15803D] text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Rate Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Black & White Card */}
            <div className="bg-white border border-[#D8D1C3] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                <span className="text-[11px] font-bold text-[#111215] uppercase tracking-wider">
                  01. Black &amp; White
                </span>
                <span className="kairo-stamp text-[#111215] border-[#111215]">
                  Standard
                </span>
              </div>

              <div>
                <label htmlFor="bw-price" className="block text-xs text-[#65625D] uppercase mb-2">
                  Price per page (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#111215]">
                    ₹
                  </span>
                  <input
                    id="bw-price"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="50"
                    required
                    value={bwPrice}
                    onChange={(e) => setBwPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-xl font-bold text-[#111215] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10px] text-[#98948C] uppercase block mb-1.5">Common Presets:</span>
                <div className="flex gap-2">
                  {[2, 3, 4].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setBwPrice(rate)}
                      className={`px-3 py-1 text-xs border cursor-pointer transition-colors ${
                        bwPrice === rate
                          ? 'border-[#111215] bg-[#111215] text-white font-bold'
                          : 'border-[#CFC7BB] bg-[#FBF9F5] text-[#65625D] hover:border-[#111215]'
                      }`}
                    >
                      ₹{rate}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-[#65625D] pt-2 border-t border-[#F0EBE3]">
                Applies to assignments, lab records, notes, and general single or double-sided documents.
              </p>
            </div>

            {/* Colour Card */}
            <div className="bg-white border border-[#D8D1C3] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider">
                  02. Full Colour
                </span>
                <span className="kairo-stamp text-[#1D4ED8] border-[#1D4ED8]">
                  Full Colour
                </span>
              </div>

              <div>
                <label htmlFor="colour-price" className="block text-xs text-[#65625D] uppercase mb-2">
                  Price per page (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#1D4ED8]">
                    ₹
                  </span>
                  <input
                    id="colour-price"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="50"
                    required
                    value={colourPrice}
                    onChange={(e) => setColourPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#1D4ED8] focus:bg-white text-xl font-bold text-[#111215] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10px] text-[#98948C] uppercase block mb-1.5">Common Presets:</span>
                <div className="flex gap-2">
                  {[5, 7, 10].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setColourPrice(rate)}
                      className={`px-3 py-1 text-xs border cursor-pointer transition-colors ${
                        colourPrice === rate
                          ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-bold'
                          : 'border-[#CFC7BB] bg-[#FBF9F5] text-[#65625D] hover:border-[#1D4ED8]'
                      }`}
                    >
                      ₹{rate}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-[#65625D] pt-2 border-t border-[#F0EBE3]">
                Applies to diagrams, PPT slides, charts, project reports, and seminar presentations.
              </p>
            </div>

          </div>

          {/* Live Simulation Preview */}
          <div className="bg-[#F5F1EA] border border-[#D8D1C3] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111215] uppercase tracking-wider">
              <Calculator className="h-4 w-4 text-[#65625D]" />
              <span>Live Student Price Simulation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 border border-[#E5DFD5]">
                <p className="text-[10px] text-[#65625D] uppercase">10-Page B&amp;W Assignment</p>
                <p className="font-bold text-base text-[#111215] mt-1">{formatCurrency(10 * bwPrice)}</p>
              </div>
              <div className="bg-white p-3 border border-[#E5DFD5]">
                <p className="text-[10px] text-[#65625D] uppercase">30-Page B&amp;W Lab Manual</p>
                <p className="font-bold text-base text-[#111215] mt-1">{formatCurrency(30 * bwPrice)}</p>
              </div>
              <div className="bg-white p-3 border border-[#E5DFD5]">
                <p className="text-[10px] text-[#65625D] uppercase">15-Page Colour Report</p>
                <p className="font-bold text-base text-[#1D4ED8] mt-1">{formatCurrency(15 * colourPrice)}</p>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-[11px] text-[#65625D]">
              * Rate changes take effect immediately on the requisition form and pricing APIs.
            </p>

            <button
              type="submit"
              disabled={saving || !isChanged}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed text-[#FBF9F5] font-bold text-xs uppercase tracking-wider py-3.5 px-8 transition-colors shadow-sm cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Rates...</span>
                </>
              ) : (
                <>
                  <span>Save Campus Rates</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
