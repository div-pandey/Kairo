import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Kairo · KCC Student Printing',
  description: 'Learn how Kairo collects, uses, and protects the personal data of KCC ITM students.',
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="font-mono-code text-sm text-[#65625D] mt-4">
            Last updated: September 2024 · Applies to all KCC ITM students using Kairo
          </p>
        </div>

        <div className="space-y-10 text-[#3D3A35]">

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">01</span>
              Who We Are
            </h2>
            <p className="text-sm leading-relaxed">
              Kairo is a campus print service for students of KCC Institute of Technology &amp; Management (KCC ITM), Greater Noida. We are committed to protecting the personal information of every student who uses our platform. This policy explains what data we collect, why we collect it, and how it is handled.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">02</span>
              What Data We Collect
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              We collect the minimum information necessary to run the service:
            </p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'Full name and email address (provided at registration)',
                'KCC student roll number (for identity verification)',
                'Mobile number (for order status notifications)',
                'Files uploaded for printing (stored temporarily and deleted after order completion)',
                'Order history including page counts, copies, and print mode selected',
                'Payment transaction references (provided by PhonePe — we do not store card/UPI details)',
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
              How We Use Your Data
            </h2>
            <p className="text-sm leading-relaxed mb-3">Your data is used solely for the following purposes:</p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'To create and manage your student account',
                'To process and fulfill your print orders',
                'To verify your eligibility as a KCC ITM student',
                'To calculate and confirm order pricing',
                'To update you on the status of your order (queued, ready, complete)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              We do not use your data for marketing, profiling, or any purpose unrelated to your print order.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">04</span>
              Data Storage &amp; Security
            </h2>
            <p className="text-sm leading-relaxed">
              Your data is stored securely on Supabase (PostgreSQL), which is hosted on servers with industry-standard encryption at rest and in transit (TLS/SSL). Access to your account data is protected by Row Level Security (RLS) policies, meaning each student can only see their own data. Passwords are stored as bcrypt hashes — never in plain text. Uploaded files are stored in a private, access-controlled storage bucket and are permanently deleted once the order is marked complete.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">05</span>
              Third-Party Services
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              We use the following third-party services, each with their own privacy policies:
            </p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'Supabase — Database and file storage (supabase.com)',
                'PhonePe Payment Gateway — Payment processing (phonepe.com)',
                'Vercel — Website hosting (vercel.com)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#65625D] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              We do not sell, rent, or trade your personal data with any third party for commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">06</span>
              Your Rights
            </h2>
            <p className="text-sm leading-relaxed mb-3">As a user of Kairo, you have the right to:</p>
            <ul className="list-none space-y-2 text-sm">
              {[
                'Access the personal data we hold about you',
                'Request correction of any inaccurate information',
                'Request deletion of your account and associated data',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:div.pandey.css@gmail.com" className="text-[#1D4ED8] underline underline-offset-2">
                div.pandey.css@gmail.com
              </a>
              . We will respond within 7 working days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">07</span>
              Cookies
            </h2>
            <p className="text-sm leading-relaxed">
              Kairo uses essential session cookies only — to keep you logged in between page visits. We do not use any advertising, analytics, or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#111215] mb-3 flex items-center gap-3">
              <span className="font-mono-code text-xs text-[#1D4ED8]">08</span>
              Contact
            </h2>
            <p className="text-sm leading-relaxed">
              For any privacy-related concerns, write to us at{' '}
              <a href="mailto:div.pandey.css@gmail.com" className="text-[#1D4ED8] underline underline-offset-2">
                div.pandey.css@gmail.com
              </a>
              .
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-[#E5DFD5] flex flex-wrap gap-6 font-mono-code text-xs text-[#65625D]">
          <Link href="/terms" className="hover:text-[#111215] transition-colors">Terms &amp; Conditions</Link>
          <Link href="/refund" className="hover:text-[#111215] transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-[#111215] transition-colors">← Back to Kairo</Link>
        </div>
      </main>
    </div>
  );
}
