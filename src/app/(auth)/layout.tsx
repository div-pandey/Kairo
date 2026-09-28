import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between px-4 py-6 sm:px-10 sm:py-10 selection:bg-[#111215] selection:text-[#FBF9F5]">
      {/* Brand Header */}
      <header className="flex justify-between items-center max-w-lg mx-auto w-full gap-3">
        <Link href="/" className="flex items-baseline gap-2 group shrink-0">
          <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-[#111215] group-hover:text-[#1D4ED8] transition-colors">
            kairo
          </span>
          <span className="font-mono-code text-[11px] text-[#65625D]">
            / KCC
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-mono-code text-[#65625D] hover:text-[#111215] transition-colors shrink-0"
        >
          <span className="hidden sm:inline">← Back to campus home</span>
          <span className="sm:hidden">← Home</span>
        </Link>
      </header>

      {/* Main Form Content */}
      <main className="my-auto py-8 flex justify-center">
        {children}
      </main>

      {/* Footer */}
      <footer className="font-mono-code text-[11px] text-[#98948C] flex flex-col items-center gap-2">
        <p>Official KCC Student Printing Service · B&amp;W ₹3 / Colour ₹5</p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-[#111215] transition-colors">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-[#111215] transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/refund" className="hover:text-[#111215] transition-colors">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
