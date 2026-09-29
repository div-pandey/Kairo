'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface FilePageBadgeProps {
  pageCount?: number;
  loading?: boolean;
  onUpdate: (count: number) => void;
}

export function FilePageBadge({ pageCount, loading, onUpdate }: FilePageBadgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(pageCount ? String(pageCount) : '');

  // Keep input value in sync if pageCount changes externally (e.g. from async detection)
  useEffect(() => {
    if (pageCount !== undefined) {
      setInputValue(String(pageCount));
    }
  }, [pageCount]);

  const commitCount = () => {
    const val = parseInt(inputValue, 10);
    if (!isNaN(val) && val > 0) {
      onUpdate(val);
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[#65625D] font-mono-code text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Counting...
      </span>
    );
  }

  if (pageCount !== undefined && !isEditing) {
    return (
      <div className="flex items-center gap-2 font-mono-code text-xs">
        <span className="kairo-stamp text-[#15803D] border-[#15803D] bg-green-50/40">
          {pageCount} {pageCount === 1 ? 'PAGE' : 'PAGES'}
        </span>
        <button
          type="button"
          onClick={() => {
            setInputValue(String(pageCount));
            setIsEditing(true);
          }}
          className="text-[11px] text-[#65625D] hover:text-[#111215] underline cursor-pointer p-0.5"
          title="Click to modify page count"
        >
          Edit
        </button>
      </div>
    );
  }

  // Editing mode or manual input needed
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commitCount();
      }}
      className="flex items-center gap-1.5 font-mono-code text-xs"
    >
      <input
        type="number"
        min={1}
        max={5000}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commitCount}
        placeholder="Pages"
        autoFocus={isEditing || pageCount === undefined}
        className="w-16 border border-[#111215] bg-white px-2 py-1 text-xs text-[#111215] outline-none rounded-none placeholder:text-[#98948C]"
      />
      <button
        type="submit"
        disabled={!inputValue || parseInt(inputValue, 10) <= 0}
        className="bg-[#111215] text-[#FBF9F5] px-2 py-1 text-[11px] font-bold uppercase hover:bg-[#1D4ED8] transition-colors cursor-pointer disabled:opacity-40 rounded-none shrink-0"
      >
        Set
      </button>
      {isEditing && (
        <button
          type="button"
          onClick={() => {
            setInputValue(pageCount ? String(pageCount) : '');
            setIsEditing(false);
          }}
          className="text-[#65625D] hover:text-[#B91C1C] text-[11px] px-1 cursor-pointer"
        >
          ✕
        </button>
      )}
    </form>
  );
}
