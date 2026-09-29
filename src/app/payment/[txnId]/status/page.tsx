'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

type PaymentStatus = 'loading' | 'pending' | 'success' | 'failed' | 'error';

interface StatusData {
  status:                PaymentStatus;
  merchantTransactionId: string;
  orderId?:              string;
  amount?:               number;   // paise
  phonepeTransactionId?: string;
  error?:                string;
}

export default function PaymentStatusPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const txnId        = params.txnId as string;

  const [data, setData]           = useState<StatusData>({ status: 'loading', merchantTransactionId: txnId });
  const [pollCount, setPollCount] = useState(0);

  const checkStatus = async () => {
    try {
      const res  = await fetch(`/api/payment/status/${txnId}`);
      const json = await res.json();

      if (!res.ok) {
        setData({ status: 'error', merchantTransactionId: txnId, error: json.error });
        return;
      }

      setData({
        status:                json.status as PaymentStatus,
        merchantTransactionId: txnId,
        orderId:               json.orderId,
        amount:                json.amount,
        phonepeTransactionId:  json.phonepeTransactionId,
      });

      // Auto-redirect to order page on success after 3s
      if (json.status === 'success' && json.orderId) {
        setTimeout(() => router.push(`/orders/${json.orderId}?payment=success`), 3000);
      }
    } catch {
      setData({ status: 'error', merchantTransactionId: txnId, error: 'Network error. Please try again.' });
    }
  };

  useEffect(() => {
    checkStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-poll every 3s while pending, up to 10 times
  useEffect(() => {
    if (data.status !== 'pending') return;
    if (pollCount >= 10) return;

    const timer = setTimeout(() => {
      setPollCount((c) => c + 1);
      checkStatus();
    }, 3000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.status, pollCount]);

  const amountRupees = data.amount ? (data.amount / 100).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center px-4 py-12 font-mono-code">
      <div className="w-full max-w-md">

        {/* Kairo wordmark */}
        <div className="text-center mb-8">
          <span className="font-display font-black text-2xl tracking-tight text-[#111215]">
            Kairo
          </span>
          <span className="block text-[10px] text-[#65625D] uppercase tracking-wider mt-0.5">
            Payment Gateway
          </span>
        </div>

        {/* Status Card */}
        <div className="bg-white border border-[#D8D1C3] shadow-[0_4px_24px_-4px_rgba(25,20,15,0.06)] p-8 relative">
          {/* Corner marks */}
          <span className="absolute top-2 left-2 text-[10px] text-[#B5ADA0] select-none">+</span>
          <span className="absolute top-2 right-2 text-[10px] text-[#B5ADA0] select-none">+</span>
          <span className="absolute bottom-2 left-2 text-[10px] text-[#B5ADA0] select-none">+</span>
          <span className="absolute bottom-2 right-2 text-[10px] text-[#B5ADA0] select-none">+</span>

          {data.status === 'loading' && (
            <div className="py-2 space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-5 w-48 mx-auto" />
                <Skeleton className="h-3 w-64 mx-auto" />
              </div>
              <div className="bg-[#FBF9F5] border border-[#E5DFD5] p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {data.status === 'pending' && (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="relative mx-auto w-12 h-12">
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
              </div>
              <p className="text-sm font-bold text-[#111215]">Payment Processing&hellip;</p>
              <p className="text-xs text-[#65625D]">
                Your payment is being processed by PhonePe. This page will auto-update.
              </p>
              <button
                onClick={() => { setPollCount(0); checkStatus(); }}
                className="inline-flex items-center gap-2 text-xs text-[#1D4ED8] hover:underline mt-2"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh status
              </button>
            </div>
          )}

          {data.status === 'success' && (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <CheckCircle2 className="h-12 w-12 text-[#15803D] mx-auto" />
              <div>
                <span className="kairo-stamp text-[#15803D] border-[#15803D] text-[10px]">
                  PAYMENT CONFIRMED
                </span>
              </div>
              <p className="text-sm font-bold text-[#111215]">Payment Successful!</p>
              {amountRupees && (
                <p className="text-2xl font-display font-black text-[#111215]">₹{amountRupees}</p>
              )}
              {data.phonepeTransactionId && (
                <p className="text-[10px] text-[#65625D]">
                  PhonePe Ref: {data.phonepeTransactionId}
                </p>
              )}
              <p className="text-xs text-[#65625D]">
                Redirecting you to your order&hellip;
              </p>
              {data.orderId && (
                <Link
                  href={`/orders/${data.orderId}?payment=success`}
                  className="inline-flex items-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider py-3 px-5 transition-colors"
                >
                  View Order <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          {(data.status === 'failed' || data.status === 'error') && (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <XCircle className="h-12 w-12 text-[#B91C1C] mx-auto" />
              <div>
                <span className="kairo-stamp text-[#B91C1C] border-[#B91C1C] text-[10px]">
                  PAYMENT FAILED
                </span>
              </div>
              <p className="text-sm font-bold text-[#111215]">
                {data.status === 'error' ? 'Something went wrong' : 'Payment was not completed'}
              </p>
              <p className="text-xs text-[#65625D]">
                {data.error ?? 'The payment was declined or cancelled. No amount has been deducted.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                {data.orderId && (
                  <Link
                    href={`/orders/${data.orderId}`}
                    className="inline-flex items-center justify-center gap-2 border border-[#111215] text-[#111215] hover:bg-[#111215] hover:text-[#FBF9F5] text-xs font-bold uppercase tracking-wider py-2.5 px-4 transition-colors"
                  >
                    Back to Order
                  </Link>
                )}
                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] text-xs font-bold uppercase tracking-wider py-2.5 px-4 transition-colors"
                >
                  My Orders
                </Link>
              </div>
            </div>
          )}

          {/* Transaction reference */}
          <div className="mt-6 pt-4 border-t border-[#E5DFD5]">
            <p className="text-[10px] text-[#98948C] text-center">
              Txn Ref: {txnId}
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-[#98948C] mt-4">
          KCC ITM Campus · Powered by PhonePe Secure Payments
        </p>

      </div>
    </div>
  );
}