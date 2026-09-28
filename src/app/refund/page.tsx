import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Kairo · KCC Student Printing',
  description: 'Understand how refunds and cancellations are handled for print orders placed through Kairo at KCC ITM.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#111215] selection:bg-[#111215] selection:text-[#FBF9F5]">

      {/* Header */}
      <header className="border-b border-[#E5DFD5] px-5 sm:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-xl font-black tracking-tight text-[#111215] group-hover:text-[#1D4ED8] transition-colors">
            kairo
          </span>
          <span className="font-mono-code text-[11px] text-[#65625D]">/ KCC</span>
        </Link>
        <Link href="/" className="font-mono-code text-xs text-[#65625D] hover:text-[#111215] transition-colors">
          ← Back to home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-10 py-14 sm:py-20">

        {/* Page Header */}
        <div className="mb-12 pb-10 border-b border-[#E5DFD5]">
          <p className="font-mono-code text-xs uppercase tracking-widest text-[#65625D] mb-4">Legal Document</p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111215] leading-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="font-mono-code text-sm text-[#65625D] mt-4">
            Last updated: September 2024 · Applies to all KCC ITM students using Kairo
          </p>
        </div>

        <div className="space-y-10 text-[#3D3A35]">

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">01</span>
              Overview &amp; Registered Entity
            </h2>
            <p className="text-sm leading-relaxed mb-2">
              Kairo is operated by <strong className="text-[#111215]">Kairo Print Services</strong> (MSME Reg: UDYAM-DL-02-0128666, SEA Reg: 2026091948). Because Kairo is a physical document printing service, orders begin processing promptly after payment confirmation.
            </p>
            <p className="text-sm leading-relaxed text-[#65625D]">
              All transactions, billing, and refunds are calculated and processed exclusively in <strong>Indian National Rupees (INR / ₹)</strong>. Please review this policy carefully before placing an order.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">02</span>
              Cancellations
            </h2>

            {/* Before printing */}
            <div className="bg-green-50 border border-green-200 p-5 mb-4">
              <p className="font-mono-code text-xs font-bold text-green-800 uppercase tracking-wider mb-2">
                ✓ Before Printing Starts
              </p>
              <p className="text-sm leading-relaxed text-green-900">
                If your order is still in <strong>Queued</strong> status and printing has not yet begun, you may request a cancellation by contacting the desk counter directly or emailing us. A full refund will be issued within 5–7 working days to your original payment method.
              </p>
            </div>

            {/* After printing */}
            <div className="bg-red-50 border border-red-200 p-5">
              <p className="font-mono-code text-xs font-bold text-red-800 uppercase tracking-wider mb-2">
                ✗ After Printing Starts
              </p>
              <p className="text-sm leading-relaxed text-red-900">
                Once an order status changes to <strong>Printing</strong> or <strong>Ready for Pickup</strong>, it cannot be cancelled or refunded, as physical resources have already been consumed.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">03</span>
              Eligible Refund Cases
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              A full or partial refund will be issued in the following cases:
            </p>
            <ul className="list-none space-y-3 text-sm">
              {[
                {
                  title: 'Print Quality Error',
                  detail: 'If the printed output is significantly different from the uploaded file due to an error on our side (e.g., wrong colour mode applied, corrupted output), we will reprint at no extra cost or issue a full refund.',
                },
                {
                  title: 'Duplicate Payment',
                  detail: 'If your account was charged more than once for a single order due to a payment gateway error, the duplicate amount will be refunded in full.',
                },
                {
                  title: 'Payment Deducted but Order Not Placed',
                  detail: 'If your money was deducted but the order did not appear in our system, contact us within 48 hours with your UPI transaction reference number. We will verify and refund within 3–5 working days.',
                },
                {
                  title: 'Service Unavailability',
                  detail: 'If we are unable to fulfill your order due to equipment failure or campus closure, a full refund will be processed automatically.',
                },
              ].map(({ title, detail }) => (
                <li key={title} className="border border-[#E5DFD5] p-4 bg-white">
                  <p className="font-mono-code text-xs font-bold text-[#111215] uppercase tracking-wide mb-1">{title}</p>
                  <p className="text-[#65625D] leading-relaxed">{detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">04</span>
              Non-Refundable Cases
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              Refunds will <strong>not</strong> be issued for the following:
            </p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'Errors in the uploaded file itself (wrong content, incorrect page range, low resolution)',
                'Settings configured incorrectly by the student (wrong colour mode, wrong number of copies)',
                'Failure to collect the printout within the stipulated time',
                'Change of mind after printing has started',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B91C1C] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">05</span>
              Refund Timeline
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[#E5DFD5] font-mono-code">
                <thead>
                  <tr className="bg-[#F3EFE8] border-b border-[#E5DFD5]">
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-[#111215]">Scenario</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-[#111215]">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {[
                    ['Pre-print cancellation', '5–7 working days'],
                    ['Duplicate payment', '3–5 working days'],
                    ['Payment deducted, order not placed', '3–5 working days'],
                    ['Service unavailability', '3–5 working days'],
                    ['Print quality error (reprint)', 'Same day or next working day'],
                  ].map(([scenario, timeline]) => (
                    <tr key={scenario} className="bg-white">
                      <td className="px-4 py-3 text-[#65625D]">{scenario}</td>
                      <td className="px-4 py-3 text-[#111215] font-bold">{timeline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#98948C] font-mono-code mt-3">
              * Refunds are credited to the original UPI account or bank account used for payment. Processing times depend on your bank.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">06</span>
              How to Request a Refund &amp; Support Contact
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              To raise a refund request or dispute, please contact our support desk:
            </p>
            <div className="text-sm leading-relaxed space-y-1.5 bg-[#F3EFE8] border border-[#E5DFD5] p-5 font-mono-code text-xs mb-4">
              <p><strong>Business Name:</strong> Kairo Print Services</p>
              <p><strong>Contact Person:</strong> Divyansh</p>
              <p><strong>Support Email:</strong> <a href="mailto:div.pandey.css@gmail.com" className="text-[#1D4ED8] underline">div.pandey.css@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 7303598548</p>
              <p><strong>Operating Address:</strong> Block B, B-1301, Mayur Vihar Phase 3, Gharoli Dairy, New Delhi, Delhi - 110096</p>
            </div>
            <p className="text-sm leading-relaxed mb-2">Please provide the following details when emailing:</p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'Your registered name and student roll number',
                'Your Kairo Order ID (visible on the order confirmation screen)',
                'UPI Transaction Reference / UTR Number',
                'Brief description of the issue',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              We typically acknowledge refund requests within 24 hours and resolve them within <strong>5–7 working days</strong>.
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-[#E5DFD5] flex flex-wrap gap-6 font-mono-code text-xs text-[#65625D]">
          <Link href="/terms" className="hover:text-[#111215] transition-colors">Terms &amp; Conditions</Link>
          <Link href="/privacy" className="hover:text-[#111215] transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-[#111215] transition-colors">← Back to Kairo</Link>
        </div>
      </main>
    </div>
  );
}
