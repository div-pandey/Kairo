import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { ArrowRight, ArrowDown, FileText } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#111215] flex flex-col selection:bg-[#111215] selection:text-[#FBF9F5]">
      <Navbar />

      <main className="flex-1">
        {/* ─── SECTION 1: HERO ──────────────────────────────────────────────── */}
        <section className="relative hero-spacious border-b border-[#E5DFD5]">
          <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center">
              
              {/* Left Column: Proposition */}
              <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-9">
                {/* Eyebrow Stamp */}
                <div>
                  <div className="inline-flex items-center gap-2.5 font-mono-code text-[11px] font-semibold tracking-wider text-[#65625D] uppercase px-3.5 py-2 border border-[#CFC7BB] bg-[#F3EFE8]/70 rounded-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8]" />
                    KCC Student Printing · Greater Noida
                  </div>
                </div>

                {/* Primary Headline */}
                <h1 className="font-display text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#111215] leading-[1.12] sm:leading-[1.1]">
                  Your college work.{' '}
                  <span className="font-editorial italic font-normal text-[#1D4ED8]">
                    Printed
                  </span>{' '}
                  without the extra cost.
                </h1>

                {/* Short Supporting Sentence */}
                <p className="text-base sm:text-xl text-[#65625D] max-w-xl font-normal leading-relaxed">
                  Upload it. Choose how you want it. Pick it up on campus.
                </p>

                {/* Instant Pricing Pill */}
                <div>
                  <div className="inline-flex items-center gap-8 py-3.5 px-2 border-y border-[#E5DFD5] font-mono-code text-sm sm:text-base">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#65625D] text-xs uppercase tracking-wide">B&amp;W</span>
                      <span className="font-bold text-[#111215] text-xl sm:text-2xl">₹3</span>
                      <span className="text-[#65625D] text-xs">/page</span>
                    </div>
                    <span className="text-[#CFC7BB] text-lg">/</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#1D4ED8] text-xs uppercase tracking-wide">Colour</span>
                      <span className="font-bold text-[#1D4ED8] text-xl sm:text-2xl">₹5</span>
                      <span className="text-[#65625D] text-xs">/page</span>
                    </div>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-5 pt-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-3 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] font-semibold text-base px-8 py-4 rounded-md transition-all shadow-sm tracking-tight cursor-pointer"
                  >
                    Start Printing
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2.5 text-[#65625D] hover:text-[#111215] font-medium text-base px-6 py-4 border border-[#E5DFD5] hover:border-[#111215] rounded-md transition-colors"
                  >
                    See how it works
                    <ArrowDown className="h-4 w-4" />
                  </a>
                </div>

                <div className="font-mono-code text-[11px] text-[#65625D] flex flex-wrap items-center gap-2 pt-2">
                  <span>[ No minimum order ]</span>
                  <span className="text-[#CFC7BB]">·</span>
                  <span>[ Verified KCC Students only ]</span>
                </div>
              </div>

              {/* Right Column: Authentic Physical Document Composition — hidden on mobile */}
              <div className="hidden sm:block lg:col-span-5 relative lg:pl-6">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Layered sheet beneath for tactile depth */}
                  <div className="absolute inset-0 bg-[#EFE9DF] border border-[#D5CDBC] rounded-sm transform rotate-3 translate-x-4 translate-y-4 z-0" />
                  <div className="absolute inset-0 bg-[#F4EFE6] border border-[#DFD7C7] rounded-sm transform -rotate-1 translate-x-2 translate-y-2 z-0" />

                  {/* Top Authentic A4 Requisition Sheet */}
                  <div className="relative z-10 bg-white border border-[#D8D1C3] p-8 sm:p-10 shadow-[0_16px_36px_-8px_rgba(25,20,15,0.08)] rounded-sm flex flex-col gap-6">
                    {/* Corner Registration Marks (+) */}
                    <span className="absolute top-3 left-3 text-[11px] font-mono-code text-[#B5ADA0] select-none">+</span>
                    <span className="absolute top-3 right-3 text-[11px] font-mono-code text-[#B5ADA0] select-none">+</span>
                    <span className="absolute bottom-3 left-3 text-[11px] font-mono-code text-[#B5ADA0] select-none">+</span>
                    <span className="absolute bottom-3 right-3 text-[11px] font-mono-code text-[#B5ADA0] select-none">+</span>

                    {/* Sheet Header */}
                    <div className="flex items-start justify-between border-b border-[#111215] pb-5">
                      <div>
                        <p className="font-display font-black text-sm tracking-tight text-[#111215] uppercase">
                          KAIRO / PRINT REQUISITION
                        </p>
                        <p className="font-mono-code text-[11px] text-[#65625D] mt-0.5">
                          KCC ITM CAMPUS PRINT DESK
                        </p>
                      </div>
                      <div className="text-right font-mono-code">
                        <span className="text-[11px] font-semibold text-[#111215] bg-[#F3EFE8] px-2.5 py-1 border border-[#CFC7BB]">
                          #KAI-2025-0142
                        </span>
                      </div>
                    </div>

                    {/* Student Info Lines */}
                    <div className="space-y-3.5 font-mono-code text-xs border-b border-[#E5DFD5] pb-6">
                      <div className="flex justify-between">
                        <span className="text-[#65625D]">STUDENT:</span>
                        <span className="font-bold text-[#111215]">Rahul Sharma</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#65625D]">ROLL NO:</span>
                        <span className="font-bold text-[#111215]">2504920100231</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#65625D]">CLASS:</span>
                        <span className="text-[#111215]">B.Tech CSE · 3rd Year (B)</span>
                      </div>
                    </div>

                    {/* Job Specification Table */}
                    <div className="space-y-2.5">
                      <p className="font-mono-code text-[11px] text-[#65625D] uppercase tracking-wider">
                        Document Specification
                      </p>
                      <div className="bg-[#FBF9F5] border border-[#E5DFD5] p-4 space-y-3 text-xs font-mono-code">
                        <div className="flex items-center gap-2 text-[#111215] font-semibold">
                          <FileText className="h-4 w-4 text-[#1D4ED8]" />
                          <span className="truncate">OS_Lab_Assignment_3.pdf</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs text-[#65625D] pt-2 border-t border-[#E5DFD5]">
                          <div>Pages: <strong className="text-[#111215]">18</strong></div>
                          <div>Mode: <strong className="text-[#111215]">B&amp;W</strong></div>
                          <div>Copies: <strong className="text-[#111215]">2</strong></div>
                        </div>
                      </div>
                    </div>

                    {/* Perforated Tear-off Slip at Bottom */}
                    <div className="perforated-rule pt-6 mt-2">
                      <div className="flex items-baseline justify-between font-mono-code">
                        <div>
                          <p className="text-[10px] text-[#65625D] uppercase">Calculated Total</p>
                          <p className="text-3xl font-extrabold text-[#111215]">
                            ₹108.00
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="kairo-stamp text-[#15803D] border-[#15803D] bg-green-50/60 font-bold">
                            READY FOR PICKUP
                          </span>
                          <p className="text-[11px] text-[#65625D] mt-1.5">
                            Desk Counter 1 · Main Block
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── SECTION 2: HOW IT WORKS ──────────────────────────────────────── */}
        <section id="how-it-works" className="section-spacious border-b border-[#E5DFD5]">
          <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div>
                <p className="font-mono-code text-xs uppercase tracking-widest text-[#65625D] mb-4">
                  01 / THE SEQUENCE
                </p>
                <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111215]">
                  How Kairo works.
                </h2>
              </div>
              <p className="text-[#65625D] text-lg max-w-md font-normal leading-relaxed">
                Four simple moves from your device to the campus print desk.
              </p>
            </div>

            {/* Horizontal Sequence — NO giant cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-14 pt-12 border-t border-[#111215]">
              {/* Step 1 */}
              <div className="flex flex-col gap-4">
                <span className="font-mono-code text-4xl sm:text-5xl font-extrabold text-[#111215] block">
                  01
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111215] uppercase tracking-wide">
                  Upload
                </h3>
                <p className="text-sm text-[#65625D] leading-relaxed">
                  Drop your files. PDF, DOCX, PPTX, or photos. Add up to 20 files in one run (up to 100MB per file).
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-4">
                <span className="font-mono-code text-4xl sm:text-5xl font-extrabold text-[#111215] block">
                  02
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111215] uppercase tracking-wide">
                  Set
                </h3>
                <p className="text-sm text-[#65625D] leading-relaxed">
                  Choose B&amp;W or colour. Choose your number of copies. Page counts auto-detect.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col gap-4">
                <span className="font-mono-code text-4xl sm:text-5xl font-extrabold text-[#111215] block">
                  03
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111215] uppercase tracking-wide">
                  Confirm
                </h3>
                <p className="text-sm text-[#65625D] leading-relaxed">
                  Check every page and the exact price before confirming. No surprise charges.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col gap-4">
                <span className="font-mono-code text-4xl sm:text-5xl font-extrabold text-[#111215] block">
                  04
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111215] uppercase tracking-wide">
                  Collect
                </h3>
                <p className="text-sm text-[#65625D] leading-relaxed">
                  Pick up your printout at the campus desk when ready. Track live on your phone.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ─── SECTION 3: PRICING (Printed Notice Board Style) ──────────────── */}
        <section id="pricing" className="section-spacious border-b border-[#E5DFD5] bg-[#F5F1EA]">
          <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
            
            <div className="mb-20">
              <p className="font-mono-code text-xs uppercase tracking-widest text-[#65625D] mb-4">
                02 / TARIFF SHEET
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111215]">
                Fair campus rates.
              </h2>
              <p className="mt-4 text-lg text-[#65625D] max-w-xl">
                No platform fee. No hidden charges. Pay only for the pages you print.
              </p>
            </div>

            {/* Editorial Price Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#CFC7BB] border border-[#CFC7BB]">
              {/* B&W */}
              <div className="bg-[#FBF9F5] p-7 sm:p-10 lg:p-14 flex flex-col gap-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs uppercase tracking-wider text-[#65625D]">
                    DOCUMENT SPEC 01
                  </span>
                  <span className="kairo-stamp text-[#111215] border-[#111215]">
                    STANDARD
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#111215]">
                    Black &amp; White
                  </h3>
                  <div className="flex items-baseline gap-2 mt-4 font-mono-code">
                    <span className="font-display text-5xl sm:text-8xl font-black text-[#111215]">
                      ₹3
                    </span>
                    <span className="text-lg text-[#65625D]">/ page</span>
                  </div>
                </div>
                <p className="text-base text-[#65625D] leading-relaxed pt-5 border-t border-[#E5DFD5]">
                  Standard for daily assignments, practical records, lecture notes, syllabus sheets, and forms.
                </p>
                <div className="font-mono-code text-xs text-[#65625D] bg-[#F3EFE8] p-4 border border-[#E5DFD5]">
                  Example: 30 pages × ₹3 = <strong className="text-[#111215] text-sm">₹90</strong>
                </div>
              </div>

              {/* Colour */}
              <div className="bg-[#FBF9F5] p-10 sm:p-14 flex flex-col gap-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs uppercase tracking-wider text-[#1D4ED8]">
                    DOCUMENT SPEC 02
                  </span>
                  <span className="kairo-stamp text-[#1D4ED8] border-[#1D4ED8]">
                    FULL COLOUR
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#111215]">
                    Full Colour
                  </h3>
                  <div className="flex items-baseline gap-2 mt-4 font-mono-code">
                    <span className="font-display text-5xl sm:text-8xl font-black text-[#1D4ED8]">
                      ₹5
                    </span>
                    <span className="text-lg text-[#65625D]">/ page</span>
                  </div>
                </div>
                <p className="text-base text-[#65625D] leading-relaxed pt-5 border-t border-[#E5DFD5]">
                  For circuit diagrams, project flowcharts, presentation slides, posters, and seminar reports.
                </p>
                <div className="font-mono-code text-xs text-[#65625D] bg-[#F3EFE8] p-4 border border-[#E5DFD5]">
                  Example: 15 colour pages × ₹5 = <strong className="text-[#111215] text-sm">₹75</strong>
                </div>
              </div>
            </div>

            {/* Note bar */}
            <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono-code text-[#65625D] gap-3 pt-4 border-t border-[#D5CDBD]">
              <span>* Pricing calculated as: Total Pages × Copies × Page Rate</span>
              <span>Available exclusively for verified KCC ITM students</span>
            </div>

          </div>
        </section>

        {/* ─── SECTION 4: WHY KAIRO (Editorial Statement) ───────────────────── */}
        <section id="why-kairo" className="section-spacious border-b border-[#E5DFD5]">
          <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
            
            <p className="font-mono-code text-xs uppercase tracking-widest text-[#65625D] mb-5">
              03 / THE REASON
            </p>

            {/* Big Editorial Statement */}
            <div className="max-w-4xl mb-12 sm:mb-24">
              <h2 className="font-display text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-[#111215] leading-[1.12]">
                Built for KCC. Because sometimes you need 40 pages tomorrow morning.
              </h2>
            </div>

            {/* Numbered Insights — NOT cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16 border-t border-[#111215] pt-14">
              <div className="flex flex-col gap-3">
                <span className="font-mono-code text-xs text-[#1D4ED8] uppercase tracking-wider block font-bold">
                  01 / Student-Only Network
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111215]">
                  Subsidised specifically for KCC ITM
                </h3>
                <p className="text-base text-[#65625D] leading-relaxed">
                  We don&apos;t serve outside commercial clients. Every slot and resource is reserved for students, keeping prices down and queues non-existent.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-mono-code text-xs text-[#1D4ED8] uppercase tracking-wider block font-bold">
                  02 / No Sneaky Platform Cuts
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111215]">
                  What you calculate is what you pay
                </h3>
                <p className="text-base text-[#65625D] leading-relaxed">
                  Local shops round up arbitrarily or charge convenience premiums. At Kairo, ₹3 means ₹3. Your invoice shows exact math before submission.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-mono-code text-xs text-[#1D4ED8] uppercase tracking-wider block font-bold">
                  03 / Mixed Format Orders
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111215]">
                  Combine PDFs, slides, and notes in one go
                </h3>
                <p className="text-base text-[#65625D] leading-relaxed">
                  Set the front cover to Colour ₹5 and the rest 30 pages to B&amp;W ₹3. Mix and match settings per file without making separate orders.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-mono-code text-xs text-[#1D4ED8] uppercase tracking-wider block font-bold">
                  04 / Live Status On Your Phone
                </span>
                <h3 className="font-display text-2xl font-bold text-[#111215]">
                  Never wait in line to ask &quot;Bhaiya hua kya?&quot;
                </h3>
                <p className="text-base text-[#65625D] leading-relaxed">
                  Check your dashboard between classes. Walk over to the campus desk only when the status changes to Ready for Collection.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ─── SECTION 5: FAQ (Clean Accordion) ─────────────────────────────── */}
        <section id="faq" className="section-spacious border-b border-[#E5DFD5]">
          <div className="max-w-4xl mx-auto px-5 sm:px-10 lg:px-12">
            
            <div className="mb-16">
              <p className="font-mono-code text-xs uppercase tracking-widest text-[#65625D] mb-4">
                04 / QUESTIONS
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111215]">
                Frequently asked questions.
              </h2>
            </div>

            <FAQAccordion />

          </div>
        </section>

        {/* ─── SECTION 6: FINAL ACTION (Receipt Motif Banner) ──────────────── */}
        <section className="section-spacious bg-[#111215] text-[#FBF9F5] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
            <div className="max-w-3xl flex flex-col gap-8">
              <p className="font-mono-code text-xs text-[#98948C] uppercase tracking-widest">
                [ READY WHEN YOU ARE ]
              </p>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                Got something to print?
                <br />
                <span className="text-[#98948C]">Send it to Kairo.</span>
              </h2>
              <p className="text-lg text-[#98948C] max-w-xl font-normal leading-relaxed">
                Register with your KCC ID in under 2 minutes. Upload your assignment or lab file now.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-5">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-3 bg-[#FBF9F5] text-[#111215] hover:bg-[#1D4ED8] hover:text-white font-semibold text-base px-8 py-4 rounded-md transition-colors shadow-sm tracking-tight"
                >
                  Start Printing Now
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[#98948C] hover:text-[#FBF9F5] font-medium text-base px-5 py-4 transition-colors"
                >
                  Already have an account? Log in →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#FBF9F5] border-t border-[#E5DFD5] py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row items-baseline justify-between gap-8 pb-10 border-b border-[#E5DFD5]">
            <div className="space-y-2">
              <span className="font-display text-2xl font-black text-[#111215]">
                kairo
              </span>
              <p className="text-xs text-[#65625D] font-mono-code">
                Student Printing Service for KCC ITM Campus, Greater Noida
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-8 font-mono-code text-xs text-[#65625D]">
              <a href="#how-it-works" className="hover:text-[#111215] transition-colors">How it works</a>
              <a href="#pricing" className="hover:text-[#111215] transition-colors">Pricing</a>
              <a href="#why-kairo" className="hover:text-[#111215] transition-colors">Why Kairo</a>
              <a href="#faq" className="hover:text-[#111215] transition-colors">FAQ</a>
              <Link href="/login" className="hover:text-[#111215] transition-colors">Student Login</Link>
              <Link href="/admin/login" className="hover:text-[#111215] transition-colors">Desk Portal</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono-code text-[#98948C] gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p>© {new Date().getFullYear()} Kairo · Operated by <strong className="text-[#111215]">Kairo Print Services</strong></p>
              <p className="text-[11px] text-[#A8A29E]">
                MSME: UDYAM-DL-02-0128666 · SEA: 2026091948 · Reg. Office: B-1301, Mayur Vihar Ph-3, New Delhi 110096
              </p>
              <p className="text-[11px] text-[#A8A29E]">
                Contact: <a href="mailto:div.pandey.css@gmail.com" className="underline hover:text-[#111215]">div.pandey.css@gmail.com</a> · +91 7303598548
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2 text-center sm:text-right">
              <p className="text-[#65625D]">All prices in INR (₹) · B&amp;W ₹3 · Colour ₹5</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4">
                <Link href="/terms" className="hover:text-[#111215] transition-colors">Terms</Link>
                <span>·</span>
                <Link href="/privacy" className="hover:text-[#111215] transition-colors">Privacy</Link>
                <span>·</span>
                <Link href="/refund" className="hover:text-[#111215] transition-colors">Refund Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
