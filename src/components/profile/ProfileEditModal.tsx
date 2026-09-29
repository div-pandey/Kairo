'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Phone, MapPin, Hash, Calendar, GraduationCap, Loader2, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';
import { COLLEGE_YEARS, KCC_PROGRAMMES } from '@/lib/constants';

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
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(initialProfile.phone_number || '');
  const [className, setClassName] = useState(initialProfile.class_name || '');
  const [year, setYear] = useState(initialProfile.year || '');
  const [section, setSection] = useState(initialProfile.section || '');
  const [roomNumber, setRoomNumber] = useState(initialProfile.room_number || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const cleanMobile = phoneNumber.trim().replace(/\D/g, '');
    if (cleanMobile && cleanMobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
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
          className,
          year,
          section: section.trim(),
          roomNumber: roomNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-[#111215] hover:bg-[#1D4ED8] text-white font-mono-code text-xs uppercase tracking-wider font-bold py-2 px-3.5 transition-colors cursor-pointer shadow-sm"
      >
        <Edit3 className="h-3.5 w-3.5" />
        <span>Edit Profile</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-[#111215]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-mono-code"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="bg-white border-2 border-[#111215] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
              <div>
                <span className="text-[10px] text-[#65625D] uppercase tracking-wider block">
                  KCC Student Portal
                </span>
                <h2 className="font-display font-black text-xl text-[#111215]">
                  Update Student Record
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="text-[#65625D] hover:text-[#111215] p-1 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#B91C1C] text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-[#15803D] text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Profile updated successfully! Refreshing...</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Roll Number (Read-only lock) */}
              <div>
                <label className="block text-[#65625D] uppercase text-[10px] mb-1">
                  KCC Roll / Enrollment Number (Verified)
                </label>
                <input
                  type="text"
                  disabled
                  value={initialProfile.kcc_id}
                  className="w-full bg-[#F3EFE8] border border-[#CFC7BB] text-[#65625D] px-3 py-2 cursor-not-allowed font-bold"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[#111215] uppercase text-[10px] font-bold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] text-[#111215] px-3 py-2 outline-none"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[#111215] uppercase text-[10px] font-bold mb-1">
                  Mobile Number (10 Digits)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] text-[#111215] px-3 py-2 outline-none"
                />
              </div>

              {/* Programme */}
              <div>
                <label className="block text-[#111215] uppercase text-[10px] font-bold mb-1">
                  Academic Programme
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] text-[#111215] px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="">Select Programme</option>
                  {KCC_PROGRAMMES.map((prog) => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Year */}
                <div>
                  <label className="block text-[#111215] uppercase text-[10px] font-bold mb-1">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] text-[#111215] px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="">Select Year</option>
                    {COLLEGE_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-[#111215] uppercase text-[10px] font-bold mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. A2, B"
                    className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] text-[#111215] px-3 py-2 outline-none"
                  />
                </div>

                {/* Classroom */}
                <div>
                  <label className="block text-[#111215] uppercase text-[10px] font-bold mb-1">
                    Classroom
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 204"
                    className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] text-[#111215] px-3 py-2 outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-[#E5DFD5]">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#111215] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold py-2.5 px-4 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="border border-[#CFC7BB] text-[#65625D] hover:text-[#111215] px-4 py-2.5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
