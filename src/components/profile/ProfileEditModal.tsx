'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Edit3,
  Shield,
  Info,
} from 'lucide-react';
import { COLLEGE_YEARS, KCC_PROGRAMMES, SECTION_SUBS } from '@/lib/constants';

interface ProfileEditModalProps {
  initialProfile: {
    full_name: string;
    phone_number?: string;
    class_name?: string;
    year?: string;
    section?: string;
    room_number?: string;
    kcc_id: string;
  };
}

export function ProfileEditModal({ initialProfile }: ProfileEditModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Extract initial 10-digit mobile number (stripping any existing +91 prefix)
  const initialDigits = (initialProfile.phone_number || '').replace(/\D/g, '').slice(-10);

  // Parse section and sub-section from existing profile (e.g. "B7" -> Section: "B", Sub-Section: "B7")
  const rawSec = (initialProfile.section || '').trim().toUpperCase();
  const initialSecLetter = rawSec.startsWith('A') ? 'A' : rawSec.startsWith('B') ? 'B' : '';
  const initialSubSec = rawSec;

  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(initialDigits);
  const [className, setClassName] = useState(initialProfile.class_name || '');
  const [year, setYear] = useState(initialProfile.year || '');
  const [section, setSection] = useState(initialSecLetter);
  const [subSection, setSubSection] = useState(initialSubSec);
  const [roomNumber, setRoomNumber] = useState(initialProfile.room_number || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idMismatchWarning, setIdMismatchWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mount check for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (open) {
      setError(null);
      setIdMismatchWarning(null);
      setSuccess(false);
      setFullName(initialProfile.full_name || '');
      setPhoneNumber((initialProfile.phone_number || '').replace(/\D/g, '').slice(-10));
      setClassName(initialProfile.class_name || '');
      setYear(initialProfile.year || '');
      const sec = (initialProfile.section || '').trim().toUpperCase();
      setSection(sec.startsWith('A') ? 'A' : sec.startsWith('B') ? 'B' : '');
      setSubSection(sec);
      setRoomNumber(initialProfile.room_number || '');
    }
  }, [open, initialProfile]);

  // Lock background scroll and listen for Escape key
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, saving]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIdMismatchWarning(null);
    setSuccess(false);

    // ── Strict Required Field Validation ──
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Full Name is required (minimum 2 characters).');
      return;
    }

    const cleanMobile = phoneNumber.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      setError('A valid 10-digit mobile number is required.');
      return;
    }

    if (!className.trim()) {
      setError('Academic Programme is required. Please choose your course.');
      return;
    }

    if (!year.trim()) {
      setError('Year of Study is required. Please choose your year.');
      return;
    }

    if (!roomNumber.trim()) {
      setError('Classroom number is required.');
      return;
    }

    if (!section.trim()) {
      setError('Section (A or B) is required.');
      return;
    }

    if (!subSection.trim()) {
      setError(`Please select a dedicated Sub-Section under Section ${section}.`);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: cleanMobile,
          className: className.trim(),
          year: year.trim(),
          section: subSection.trim(),
          roomNumber: roomNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.idMismatch) {
          setIdMismatchWarning(data.reason || data.error);
        }
        throw new Error(data.error || 'Failed to update profile.');
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  }

  const modalContent = open ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Premium Glassmorphic Backdrop: Soft warm optical blur across entire viewport */}
      <div
        className="fixed inset-0 bg-[#111215]/40 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={() => !saving && setOpen(false)}
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full max-w-lg bg-[#FAF8F5] border border-[#D8D1C3] rounded-xl shadow-[0_25px_60px_-15px_rgba(17,18,21,0.25),0_0_0_1px_rgba(17,18,21,0.06)] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#F2ECE1] border-b border-[#E5DFD5] px-6 py-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-mono-code text-[10px] font-bold text-[#7C756B] uppercase tracking-widest block">
              [ KCC ITM &middot; STUDENT RECORD ]
            </span>
            <h2 className="font-display font-black text-xl text-[#111215] tracking-tight">
              Update Student Profile
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={saving}
            className="text-[#65625D] hover:text-[#111215] hover:bg-[#E5DFD5]/70 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-4 max-h-[calc(88vh-80px)] overflow-y-auto">
          {/* ID Mismatch Warning Callout */}
          {idMismatchWarning && (
            <div className="p-4 bg-amber-50 border-2 border-amber-500/80 text-amber-900 rounded-lg flex items-start gap-3 shadow-xs animate-in fade-in">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-mono-code font-bold text-xs uppercase tracking-wider text-amber-900">
                  Student ID Card Mismatch Warning
                </p>
                <p className="font-mono-code text-xs text-amber-800 leading-relaxed font-semibold">
                  {idMismatchWarning}
                </p>
                <p className="font-mono-code text-[11px] text-amber-700 leading-normal">
                  Your updated profile details must match the official student ID card uploaded during registration. You cannot save details that contradict your ID card.
                </p>
              </div>
            </div>
          )}

          {/* Standard Error Notice */}
          {error && !idMismatchWarning && (
            <div className="p-3.5 bg-red-50/95 border border-red-200 text-[#B91C1C] text-xs font-mono-code flex items-start gap-2.5 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Notification */}
          {success && (
            <div className="p-3.5 bg-green-50/95 border border-green-200 text-[#15803D] text-xs font-mono-code flex items-center gap-2 rounded-md">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Profile updated successfully! Refreshing view...</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Roll Number (Verified Credential Card - Permanent) */}
            <div className="bg-[#EFEAE1]/75 border border-[#D8D1C3] p-3.5 rounded-lg flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-mono-code text-[10px] font-semibold text-[#7C756B] uppercase tracking-wider block">
                  KCC Roll / Enrollment Number
                </span>
                <span className="font-mono-code text-sm font-bold text-[#111215] tracking-wide block mt-0.5 truncate">
                  {initialProfile.kcc_id}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D8D1C3] text-[10px] font-mono-code font-bold text-[#15803D] uppercase tracking-wider rounded-md shadow-2xs shrink-0">
                <Shield className="h-3 w-3 text-[#15803D]" />
                <span>Verified</span>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-mono-code text-[11px] font-bold text-[#111215] uppercase tracking-wider mb-1.5">
                Full Name <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-[#D8D1C3] focus:border-[#111215] focus:ring-1 focus:ring-[#111215] text-sm text-[#111215] px-3.5 py-2.5 rounded-md outline-none transition-all placeholder:text-[#98948C]"
                placeholder="Your full legal name as on ID card"
              />
            </div>

            {/* Mobile Number with Non-Editable +91 Prefix */}
            <div>
              <label className="block font-mono-code text-[11px] font-bold text-[#111215] uppercase tracking-wider mb-1.5">
                Mobile Number (10 Digits) <span className="text-[#B91C1C]">*</span>
              </label>
              <div className="flex rounded-md overflow-hidden border border-[#D8D1C3] focus-within:border-[#111215] focus-within:ring-1 focus-within:ring-[#111215] transition-all bg-white">
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center px-3.5 bg-[#F2ECE1] border-r border-[#D8D1C3] font-mono-code text-sm font-bold text-[#111215] select-none shrink-0"
                  title="Country Code (+91)"
                >
                  +91
                </span>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full bg-white text-sm text-[#111215] font-mono-code px-3.5 py-2.5 outline-none placeholder:text-[#98948C]"
                />
              </div>
              <p className="mt-1 font-mono-code text-[10px] text-[#7C756B]">
                10-digit mobile number for order pickup notifications
              </p>
            </div>

            {/* Academic Programme */}
            <div>
              <label className="block font-mono-code text-[11px] font-bold text-[#111215] uppercase tracking-wider mb-1.5">
                Academic Programme <span className="text-[#B91C1C]">*</span>
              </label>
              <select
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-white border border-[#D8D1C3] focus:border-[#111215] focus:ring-1 focus:ring-[#111215] text-sm text-[#111215] px-3.5 py-2.5 rounded-md outline-none transition-all cursor-pointer"
              >
                <option value="">Select Programme</option>
                {KCC_PROGRAMMES.map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>

            {/* Year & Classroom Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Year */}
              <div>
                <label className="block font-mono-code text-[11px] font-bold text-[#111215] uppercase tracking-wider mb-1.5">
                  Year of Study <span className="text-[#B91C1C]">*</span>
                </label>
                <select
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-white border border-[#D8D1C3] focus:border-[#111215] focus:ring-1 focus:ring-[#111215] text-sm text-[#111215] px-3 py-2.5 rounded-md outline-none transition-all cursor-pointer"
                >
                  <option value="">Select Year</option>
                  {COLLEGE_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Classroom */}
              <div>
                <label className="block font-mono-code text-[11px] font-bold text-[#111215] uppercase tracking-wider mb-1.5">
                  Classroom <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 215 or Room 307"
                  className="w-full bg-white border border-[#D8D1C3] focus:border-[#111215] focus:ring-1 focus:ring-[#111215] text-sm text-[#111215] font-mono-code px-3.5 py-2.5 rounded-md outline-none transition-all placeholder:text-[#98948C]"
                />
              </div>
            </div>

            {/* Section & Sub-Section Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Main Section Dropdown (A or B) */}
              <div>
                <label className="block font-mono-code text-[11px] font-bold text-[#111215] uppercase tracking-wider mb-1.5">
                  Section <span className="text-[#B91C1C]">*</span>
                </label>
                <select
                  required
                  value={section}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSection(val);
                    setSubSection('');
                  }}
                  className="w-full bg-white border border-[#D8D1C3] focus:border-[#111215] focus:ring-1 focus:ring-[#111215] text-sm text-[#111215] px-3 py-2.5 rounded-md outline-none transition-all cursor-pointer font-mono-code"
                >
                  <option value="">Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>

              {/* Dedicated Sub-Section Dropdown */}
              <div>
                <label className="block font-mono-code text-[11px] font-bold text-[#111215] uppercase tracking-wider mb-1.5">
                  Sub-Section <span className="text-[#B91C1C]">*</span>
                </label>
                <select
                  required
                  value={subSection}
                  disabled={!section || !SECTION_SUBS[section]}
                  onChange={(e) => setSubSection(e.target.value)}
                  className="w-full bg-white border border-[#D8D1C3] focus:border-[#111215] focus:ring-1 focus:ring-[#111215] disabled:bg-[#F3EFE8] disabled:cursor-not-allowed disabled:text-[#98948C] text-sm text-[#111215] px-3 py-2.5 rounded-md outline-none transition-all cursor-pointer font-mono-code"
                >
                  <option value="">
                    {section ? `Select ${section} Sub-Section` : 'Choose Section A or B first'}
                  </option>
                  {section &&
                    SECTION_SUBS[section]?.map((sub) => (
                      <option key={sub} value={sub}>
                        Sub-Section {sub}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* AI Verification Notice banner */}
            <div className="flex items-center gap-2 p-2.5 bg-[#EFEAE1]/60 border border-[#D8D1C3] rounded-md text-[11px] font-mono-code text-[#65625D]">
              <Info className="h-4 w-4 text-[#1D4ED8] shrink-0" />
              <span>
                Name and Programme changes are verified against your uploaded KCC Student ID card.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5DFD5]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="px-4 py-2.5 text-xs font-mono-code font-bold uppercase tracking-wider text-[#65625D] hover:text-[#111215] hover:bg-[#EFEAE1]/70 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-1.5 bg-[#111215] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-mono-code text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-md shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying &amp; Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-[#111215] hover:bg-[#1D4ED8] text-white font-mono-code text-xs uppercase tracking-wider font-bold py-2 px-3.5 rounded-md transition-all cursor-pointer shadow-xs hover:shadow"
      >
        <Edit3 className="h-3.5 w-3.5" />
        <span>Edit Profile</span>
      </button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
