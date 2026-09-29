'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

interface PayNowButtonProps {
  orderId:     string;
  amount:      number;
  disabled?:   boolean;
}

export function PayNowButton({ orderId, amount, disabled }: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch('/api/payment/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? 'Failed to initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to PhonePe payment page
      window.location.href = data.redirectUrl;
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={loading || disabled}
        id="pay-now-btn"
        className="inline-flex items-center gap-2.5 bg-[#1D4ED8] hover:bg-[#1E3A8A] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-mono-code font-bold uppercase tracking-wider py-3 px-6 transition-colors shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to PhonePe&hellip;
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pay &#8377;{amount.toFixed(2)} via PhonePe
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-[#B91C1C] font-mono-code">{error}</p>
      )}
    </div>
  );
}