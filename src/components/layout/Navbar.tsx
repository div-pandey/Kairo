'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 border-b border-[#E5DFD5] transition-all backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Left: Brand mark */}
          <Link href="/" className="flex items-baseline gap-2.5 group">
            <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-[#111215] group-hover:text-blue-700 transition-colors">
              kairo
            </span>
            <span className="font-mono-code text-[11px] font-medium tracking-wider text-[#65625D] uppercase hidden sm:inline">
              / KCC ITM
            </span>
          </Link>

          {/* Center: Desktop anchor navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#65625D] tracking-wide">
            <a href="#how-it-works" className="hover:text-[#111215] transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-[#111215] transition-colors">
              Pricing
            </a>
            <a href="#why-kairo" className="hover:text-[#111215] transition-colors">
              Why Kairo
            </a>
            <a href="#faq" className="hover:text-[#111215] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login"
              className="text-[13px] font-medium text-[#65625D] hover:text-[#111215] transition-colors px-2 py-1"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-[#111215] text-[#FBF9F5] hover:bg-[#2563EB] text-[13px] font-semibold px-4 py-2.5 rounded-md transition-colors tracking-tight shadow-sm"
            >
              Start Printing
            </Link>
          </div>

          {/* Mobile: Right side — login + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/login"
              className="font-mono-code text-xs text-[#65625D] hover:text-[#111215] transition-colors"
            >
              Log in
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[#111215] border border-[#CFC7BB] bg-white"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5DFD5] bg-[#FBF9F5] px-5 py-4 space-y-1 font-mono-code text-sm text-[#65625D]">
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block py-3 border-b border-[#F0EBE3] hover:text-[#111215]">How it works</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} className="block py-3 border-b border-[#F0EBE3] hover:text-[#111215]">Pricing</a>
          <a href="#why-kairo" onClick={() => setMobileOpen(false)} className="block py-3 border-b border-[#F0EBE3] hover:text-[#111215]">Why Kairo</a>
          <a href="#faq" onClick={() => setMobileOpen(false)} className="block py-3 border-b border-[#F0EBE3] hover:text-[#111215]">FAQ</a>
          <div className="pt-3">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center bg-[#111215] text-[#FBF9F5] font-bold text-xs uppercase tracking-wider py-3.5 hover:bg-[#1D4ED8] transition-colors"
            >
              Start Printing →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
