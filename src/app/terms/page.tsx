import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Kairo · KCC Student Printing',
  description: 'Terms and conditions for using the Kairo campus print ordering service at KCC ITM, Greater Noida.',
};

export default function TermsPage() {
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
        <div className="flex items-center gap-4 font-mono-code text-xs">
          <Link href="/dashboard" className="text-[#65625D] hover:text-[#111215] transition-colors">
            Dashboard
          </Link>
          <Link href="/" className="text-[#65625D] hover:text-[#111215] transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-10 py-14 sm:py-20">

        {/* Page Header */}
        <div className="mb-12 pb-10 border-b border-[#E5DFD5]">
          <p className="font-mono-code text-xs uppercase tracking-widest text-[#65625D] mb-4">Legal Document</p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111215] leading-tight">
            Terms &amp; Conditions
          </h1>
          <p className="font-mono-code text-sm text-[#65625D] mt-4">
            Last updated: September 2024 · Applies to all KCC ITM students using Kairo
          </p>
        </div>

        <div className="space-y-10 text-[#3D3A35]">

          {/* Section */}
          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">01</span>
              About Kairo &amp; Registered Entity
            </h2>
            <p className="text-sm leading-relaxed mb-2">
              Kairo is an online campus print order management service exclusively for students of KCC Institute of Technology &amp; Management (KCC ITM), Greater Noida, Uttar Pradesh.
            </p>
            <p className="text-sm leading-relaxed mb-2">
              The service is owned and operated by <strong className="text-[#111215]">Kairo Print Services</strong>, a sole proprietorship registered under the Ministry of MSME (Udyam Registration: <strong className="text-[#111215]">UDYAM-DL-02-0128666</strong>) and the Delhi Shops &amp; Establishments Act, 1954 (Registration No: <strong className="text-[#111215]">2026091948</strong>).
            </p>
            <p className="text-sm leading-relaxed text-[#65625D]">
              <strong>Registered Office:</strong> Block B, B-1301, Mayur Vihar Phase 3, Gharoli Dairy, New Delhi, Delhi - 110096, India.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">02</span>
              Eligibility
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              This service is available exclusively to currently enrolled students of KCC ITM, Greater Noida. To create an account, you must provide:
            </p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'A valid KCC institutional email address or student roll number',
                'A valid mobile number registered in India (+91)',
                'Accurate personal information as required during registration',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">03</span>
              Order Placement
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              When you place a print order through Kairo:
            </p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'You confirm that the files you upload are your own or that you have the right to print them.',
                'You confirm the configured settings (pages, copies, colour mode) are accurate before submitting.',
                'Orders are queued immediately upon payment confirmation and cannot be cancelled once printing has begun.',
                'You agree to collect the printout from the designated desk counter within the specified timeframe.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">04</span>
              Pricing &amp; Payments (INR)
            </h2>
            <p className="text-sm leading-relaxed mb-2">
              All prices displayed on Kairo are denominated and charged in <strong>Indian National Rupees (INR / ₹)</strong> inclusive of all applicable charges.
            </p>
            <p className="text-sm leading-relaxed">
              The standard rates are <strong>₹3.00 INR per page</strong> for Black &amp; White and <strong>₹5.00 INR per page</strong> for Colour printing. Total pricing is calculated as: <code>Total Pages × Number of Copies × Rate per Page</code>. Payments are processed securely via PhonePe Payment Gateway. Kairo does not store or process debit/credit card or UPI PIN credentials.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">05</span>
              Acceptable Use
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              You agree not to use Kairo to print content that is:
            </p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'Unlawful, defamatory, obscene, or infringing on any third-party intellectual property',
                'Commercially intended (reselling printed materials)',
                'Related to external parties unaffiliated with KCC ITM',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B91C1C] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Violation of this policy may result in immediate account suspension.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">06</span>
              Limitation of Liability
            </h2>
            <p className="text-sm leading-relaxed">
              Kairo and its operators are not liable for any indirect, incidental, or consequential damages arising from use of the service, including print quality issues caused by the source file, delays due to high order volume, or errors in settings configured by the user. Our maximum liability in any case is limited to the amount paid for the specific order in question.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">07</span>
              Modifications
            </h2>
            <p className="text-sm leading-relaxed">
              These Terms may be updated from time to time. Continued use of the platform after any changes constitutes acceptance of the revised Terms. We will update the "Last updated" date at the top of this page when changes are made.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">08</span>
              Contact &amp; Grievances
            </h2>
            <div className="text-sm leading-relaxed space-y-1.5 bg-[#F3EFE8] border border-[#E5DFD5] p-5 font-mono-code text-xs">
              <p><strong>Entity Name:</strong> Kairo Print Services</p>
              <p><strong>Contact Person:</strong> Divyansh</p>
              <p><strong>Email:</strong> <a href="mailto:div.pandey.css@gmail.com" className="text-[#1D4ED8] underline">div.pandey.css@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 7303598548</p>
              <p><strong>Operating &amp; Registered Address:</strong> Block B, B-1301, Mayur Vihar Phase 3, Gharoli Dairy, New Delhi, Delhi - 110096</p>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-[#E5DFD5] flex flex-wrap gap-6 font-mono-code text-xs text-[#65625D]">
          <Link href="/privacy" className="hover:text-[#111215] transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-[#111215] transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-[#111215] transition-colors">← Back to Kairo</Link>
        </div>
      </main>
    </div>
  );
}
