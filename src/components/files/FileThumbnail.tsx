'use client';

import { useState, useEffect, useMemo } from 'react';
import { Eye, FileText, Image as ImageIcon, X, ExternalLink, FileSpreadsheet } from 'lucide-react';

interface Props {
  file?: File;
  storageUrl?: string;
  name: string;
  type: string;
  className?: string;
}

export function FileThumbnail({ file, storageUrl, name, type, className = '' }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const ext = name.split('.').pop()?.toLowerCase() || '';
  const isImage = type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  const isPdf = type === 'application/pdf' || ext === 'pdf';
  const isOffice = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(ext);

  // Generate object URL for uploaded browser File
  useEffect(() => {
    if (file && (isImage || isPdf)) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, isImage, isPdf]);

  const activeUrl = objectUrl || storageUrl;

  return (
    <>
      <div
        onClick={() => {
          if (activeUrl) setShowPreviewModal(true);
        }}
        title={activeUrl ? `Click to inspect ${name}` : name}
        className={`relative shrink-0 group select-none ${activeUrl ? 'cursor-pointer' : ''} ${className}`}
      >
        {isImage && activeUrl ? (
          <div className="w-10 h-12 bg-white border border-[#CFC7BB] group-hover:border-[#111215] overflow-hidden shadow-2xs transition-all relative">
            {/* eslint-disable-next-js/no-img-element */}
            <img
              src={activeUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
        ) : isPdf ? (
          <div className="w-10 h-12 bg-white border border-[#D8D1C3] group-hover:border-[#B91C1C] p-1 flex flex-col justify-between shadow-2xs transition-all relative overflow-hidden">
            {/* Miniature PDF paper styling */}
            <div className="flex items-center justify-between border-b border-red-100 pb-0.5">
              <span className="text-[7px] font-black text-[#B91C1C] tracking-tighter uppercase font-mono-code">
                PDF
              </span>
              <span className="text-[6px] text-zinc-400 font-mono-code">P.1</span>
            </div>
            {/* Miniature paper text lines simulation */}
            <div className="space-y-1 my-auto px-0.5">
              <div className="h-0.5 bg-zinc-300 w-full rounded-xs" />
              <div className="h-0.5 bg-zinc-200 w-4/5 rounded-xs" />
              <div className="h-0.5 bg-zinc-200 w-3/5 rounded-xs" />
            </div>
            <div className="text-[6px] font-bold text-center text-zinc-500 font-mono-code truncate">
              {ext.toUpperCase()}
            </div>
            {activeUrl && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Eye className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ) : isOffice ? (
          <div className="w-10 h-12 bg-amber-50 border border-amber-200 p-1 flex flex-col justify-between shadow-2xs font-mono-code">
            <span className="text-[7px] font-bold text-amber-800 uppercase">{ext}</span>
            <FileSpreadsheet className="h-4 w-4 text-amber-600 mx-auto" />
            <span className="text-[6px] text-amber-700 text-center">DOC</span>
          </div>
        ) : (
          <div className="w-10 h-12 bg-[#FBF9F5] border border-[#D8D1C3] p-1 flex flex-col justify-between shadow-2xs font-mono-code">
            <FileText className="h-4 w-4 text-[#65625D] mx-auto my-auto" />
            <span className="text-[6px] text-center text-[#98948C] truncate">{ext}</span>
          </div>
        )}
      </div>

      {/* Interactive Quick Preview Modal */}
      {showPreviewModal && activeUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-mono-code animate-fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="bg-[#111215] text-[#FBF9F5] border-2 border-[#3E424B] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-[#26282E] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                {isImage ? (
                  <ImageIcon className="h-4 w-4 text-[#1D4ED8] shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-[#B91C1C] shrink-0" />
                )}
                <span className="font-bold text-xs truncate text-white">
                  Document Preview: {name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-[#98948C] hover:text-white hover:bg-[#1E2026] transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-[#98948C] hover:text-white hover:bg-[#1E2026] transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 bg-[#1E2026] flex items-center justify-center min-h-[350px]">
              {isImage ? (
                // eslint-disable-next-js/no-img-element
                <img
                  src={activeUrl}
                  alt={name}
                  className="max-h-[70vh] max-w-full object-contain border border-[#3E424B] shadow-lg"
                />
              ) : isPdf ? (
                <iframe
                  src={`${activeUrl}#toolbar=0&navpanes=0`}
                  title={name}
                  className="w-full h-[65vh] border border-[#3E424B] bg-white"
                />
              ) : (
                <div className="text-center p-8 text-[#98948C]">
                  <FileText className="h-10 w-10 mx-auto text-[#65625D] mb-2" />
                  <p className="text-xs">Preview unavailable for this format.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#26282E] bg-[#17191E] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#98948C]">
                Verify pages and print margins before confirming requisition
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="bg-[#FBF9F5] hover:bg-white text-[#111215] px-4 py-1.5 font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
