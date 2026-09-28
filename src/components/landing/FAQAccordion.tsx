'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'What files can I upload?',
    a: 'PDF, DOCX, PPTX, and image files (JPG, PNG). PDF is recommended for assignments to keep formatting identical.',
  },
  {
    q: 'How much does it cost?',
    a: '₹3 per page for Black & White, ₹5 per page for Colour. No platform fee, no minimum charge, no hidden costs.',
  },
  {
    q: 'Can I upload multiple files in one order?',
    a: 'Yes. You can upload up to 20 files in a single order (up to 100MB per file) and set B&W or Colour and copies independently for each file.',
  },
  {
    q: 'Can I change an order after confirming?',
    a: 'No. Because printing starts shortly after confirmation, orders cannot be edited. Please review your page count and preview before confirming.',
  },
  {
    q: 'Why do you need my KCC Student ID?',
    a: 'Kairo is exclusively subsidised for KCC ITM students. Your ID card is verified once at registration to prevent abuse.',
  },
  {
    q: 'How will I know when my printout is ready?',
    a: 'Your dashboard updates from Pending → Accepted → Printing → Ready for Collection in real time. We also notify you once it arrives at the campus desk.',
  },
];

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [faq.a]);

  return (
    <div className="border-b border-[#E5DFD5]">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-baseline justify-between text-left group gap-6 cursor-pointer focus:outline-none"
        aria-expanded={isOpen}
      >
        <span
          className="font-display text-lg sm:text-xl font-bold text-[#111215] group-hover:text-blue-700 transition-colors"
        >
          {faq.q}
        </span>
        <span
          className="font-mono-code text-sm text-[#65625D] shrink-0 pt-1 transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>

      {/* Animated slide-down content */}
      <div
        className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          maxHeight: isOpen ? `${height}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="pb-6 pr-12 text-[#65625D] text-base leading-relaxed font-normal max-w-3xl">
          {faq.a}
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="border-t border-[#E5DFD5]">
      {FAQS.map((faq, idx) => (
        <FAQItem
          key={idx}
          faq={faq}
          isOpen={openIndex === idx}
          onToggle={() => toggle(idx)}
        />
      ))}
    </div>
  );
}
