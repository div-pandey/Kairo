import Link from 'next/link';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';

export const metadata = {
  title: '404 — Page Not Found | Kairo',
  description: 'The requested page or document requisition could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#111215] flex flex-col justify-between px-4 py-8 sm:p-12 font-sans selection:bg-[#111215] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#E5DFD5] pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display font-black text-xl tracking-tight text-[#111215]">KAIRO</span>
          <span className="font-mono-code text-[10px] text-[#65625D] uppercase tracking-widest border-l border-[#CFC7BB] pl-2">
            Campus Print
          </span>
        </Link>
        <span className="font-mono-code text-[11px] text-[#98948C] uppercase tracking-wider">
          Error 404 / Document Not Found
        </span>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto my-auto text-center space-y-6 py-12">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#111215] text-[#FBF9F5] mb-2">
          <FileQuestion className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <p className="font-mono-code text-xs text-[#DC2626] font-semibold uppercase tracking-widest">
            [ HTTP 404 &mdash; REQUISITION MISSING ]
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-[#111215] tracking-tight">
            Page Not Found
          </h1>
          <p className="font-mono-code text-sm text-[#65625D] max-w-md mx-auto leading-relaxed pt-2">
            The page, order docket, or file index you are attempting to access does not exist or has been archived.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] px-6 py-3 font-mono-code text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#CFC7BB] hover:border-[#111215] bg-white text-[#111215] px-6 py-3 font-mono-code text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5DFD5] pt-4 text-center">
        <p className="font-mono-code text-[11px] text-[#98948C]">
          KCC Institute of Technology &amp; Management &middot; Knowledge Park III, Greater Noida
        </p>
      </footer>
    </div>
  );
}
