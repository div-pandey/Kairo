'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  category?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  category,
  children,
  size = 'md',
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="fixed inset-0 bg-[#111215]/45 backdrop-blur-md transition-opacity" />
      <div
        className={cn(
          'relative z-10 w-full bg-[#FBF9F5] border-2 border-[#111215] shadow-[6px_6px_0px_#111215] sm:shadow-[8px_8px_0px_#111215] animate-fade-in my-auto',
          sizes[size],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle registration marks in 4 corners */}
        <span className="absolute top-1.5 left-1.5 text-[10px] font-mono-code text-[#B5ADA0] select-none pointer-events-none">+</span>
        <span className="absolute top-1.5 right-1.5 text-[10px] font-mono-code text-[#B5ADA0] select-none pointer-events-none">+</span>
        <span className="absolute bottom-1.5 left-1.5 text-[10px] font-mono-code text-[#B5ADA0] select-none pointer-events-none">+</span>
        <span className="absolute bottom-1.5 right-1.5 text-[10px] font-mono-code text-[#B5ADA0] select-none pointer-events-none">+</span>

        {title && (
          <div className="flex items-start justify-between border-b-2 border-[#111215] bg-[#F3EFE8] px-5 sm:px-6 py-4">
            <div className="space-y-0.5">
              <span className="font-mono-code text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#1D4ED8] block">
                {category || '[ KAIRO CAMPUS PRINT DESK ]'}
              </span>
              <h2 className="font-display font-black text-lg sm:text-xl text-[#111215] tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="font-mono-code text-[11px] text-[#65625D]">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="border border-[#111215] bg-[#FBF9F5] hover:bg-[#111215] hover:text-[#FBF9F5] p-1.5 transition-colors cursor-pointer text-[#111215] shrink-0 ml-4"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(88vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
