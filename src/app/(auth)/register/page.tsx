'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Upload, ArrowRight, Check, X, CreditCard, AlertCircle, ShieldCheck } from 'lucide-react';
import { COLLEGE_YEARS, KCC_PROGRAMMES } from '@/lib/constants';

const SECTION_SUBS: Record<string, string[]> = {
  A: ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10'],
  B: ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11'],
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [showSampleCard, setShowSampleCard] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    mobileNumber: '',
    kccId: '',
    className: '',
    year: '',
    section: '',
    subSection: '',
    classroomNumber: '',
    email: '',
    password: '',
  });

  // Password strength 0-4
  function getPasswordStrength(p: string): number {
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  }

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#DC2626', '#D97706', '#2563EB', '#15803D'];
  const pwStrength = getPasswordStrength(form.password);

  function validateEmail(val: string): boolean {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) { setEmailError('Email address is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setEmailError('Please enter a valid email address.'); return false; }
    setEmailError(''); return true;
  }

  function validatePassword(val: string): boolean {
    if (val.length < 8) { setPasswordError('Password must be at least 8 characters.'); return false; }
    if (val.length > 72) { setPasswordError('Password cannot exceed 72 characters.'); return false; }
    setPasswordError(''); return true;
  }

  function validateConfirm(val: string): boolean {
    if (val !== form.password) { setConfirmError('Passwords do not match.'); return false; }
    setConfirmError(''); return true;
  }

  const [mobileError, setMobileError] = useState('');
  const [rollError, setRollError] = useState('');

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  function validateMobile(val: string): boolean {
    const digits = val.trim();
    if (!digits) {
      setMobileError('Mobile number is required.');
      return false;
    }
    if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
      setMobileError('The mobile number is invalid.');
      return false;
    }
    setMobileError('');
    return true;
  }

  function validateRoll(val: string): boolean {
    const roll = val.trim();
    if (!roll) {
      setRollError('Roll number is required.');
      return false;
    }
    if (roll.length !== 13 || !/^\d{13}$/.test(roll)) {
      setRollError('The roll number is incorrect. If it is not wrong, contact the developer.');
      return false;
    }
    setRollError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const isMobileValid = validateMobile(form.mobileNumber);
    const isRollValid = validateRoll(form.kccId);

    if (!isMobileValid || !isRollValid) {
      setError('Please resolve the highlighted field errors before submitting.');
      return;
    }

    if (!idCardFile) {
      setError('Please attach your KCC Student ID card photo.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      // Combine section + subSection into one value (e.g. "A3") for the API
      const combinedSection = form.subSection || form.section;
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'section') formData.append('section', combinedSection);
        else if (k === 'subSection') return; // skip — already merged above
        else formData.append(k, v);
      });
      formData.append('idCard', idCardFile);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <>
      {/* Sample ID Card Modal */}
      {showSampleCard && (
        <div
          className="fixed inset-0 bg-[#111215]/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setShowSampleCard(false)}
        >
          <div
            className="bg-white border border-[#D8D1C3] shadow-2xl max-w-sm w-full rounded-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5DFD5]">
              <div>
                <p className="font-mono-code text-[11px] uppercase tracking-widest text-[#65625D]">
                  Sample Reference
                </p>
                <p className="font-display font-bold text-base text-[#111215]">
                  KCC Student ID Card
                </p>
              </div>
              <button
                onClick={() => setShowSampleCard(false)}
                className="text-[#65625D] hover:text-[#111215] transition-colors p-1 rounded"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ID Card Image */}
            <div className="p-5">
              <div className="relative w-full h-80 bg-[#F3EFE8] border border-[#E5DFD5] rounded-sm overflow-hidden p-2">
                <Image
                  src="/kcc-specimen-id.png"
                  alt="Sample KCC ITM Student ID card template"
                  fill
                  className="object-contain"
                  sizes="(max-width: 400px) 100vw, 400px"
                />
              </div>

              {/* Key points */}
              <div className="mt-4 space-y-2.5 font-mono-code text-xs text-[#65625D]">
                <p className="font-bold text-[#111215] uppercase tracking-wide text-[11px]">
                  Your card must show:
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-[#1D4ED8] font-bold mt-0.5">→</span>
                    <span>Student Roll / Enrollment number</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#1D4ED8] font-bold mt-0.5">→</span>
                    <span>Your full name and course (e.g. B.Tech, BCA, BBA, MBA)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#1D4ED8] font-bold mt-0.5">→</span>
                    <span>Session or academic year</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#1D4ED8] font-bold mt-0.5">→</span>
                    <span>KCC header and official stamp/issuing authority</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setShowSampleCard(false)}
                className="w-full bg-[#111215] text-[#FBF9F5] font-mono-code text-xs uppercase tracking-wider py-3 hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                Got it — close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl">
        <div className="bg-white border border-[#D8D1C3] p-5 sm:p-10 shadow-[0_4px_24px_-4px_rgba(25,20,15,0.06)] rounded-sm">

          {/* Header */}
          <div className="mb-8 border-b border-[#E5DFD5] pb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-wider">
                [ KCC STUDENT ENROLLMENT ]
              </span>
              <span className="font-mono-code text-xs font-bold text-[#111215]">
                STEP 0{step} / 02
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111215] tracking-tight">
              Register for Campus Printing
            </h1>
            <p className="text-sm text-[#65625D] mt-1 font-normal">
              Exclusively available to current students of KCC ITM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label
                    htmlFor="register-fullname"
                    className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5"
                  >
                    Full Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="register-fullname"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3.5 py-2.5 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="register-mobile"
                    className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5"
                  >
                    Mobile Number <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="flex">
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center px-3.5 bg-[#F3EFE8] border border-r-0 border-[#CFC7BB] font-mono-code text-sm font-bold text-[#111215] select-none shrink-0"
                      title="Default Country Code (+91)"
                    >
                      +91
                    </span>
                    <input
                      id="register-mobile"
                      type="tel"
                      inputMode="numeric"
                      required
                      value={form.mobileNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        update('mobileNumber', val);
                        if (mobileError && val.length === 10) {
                          setMobileError('');
                        }
                      }}
                      onBlur={() => validateMobile(form.mobileNumber)}
                      placeholder="9876543210"
                      className={`w-full bg-[#FBF9F5] border ${
                        mobileError ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#CFC7BB] focus:border-[#111215]'
                      } focus:bg-white text-sm text-[#111215] px-3.5 py-2.5 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]`}
                    />
                  </div>
                  {mobileError ? (
                    <p className="mt-1.5 font-mono-code text-xs text-[#DC2626] flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{mobileError}</span>
                    </p>
                  ) : (
                    <p className="mt-1 font-mono-code text-[11px] text-[#98948C]">
                      10-digit mobile number for order pickup notifications
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="register-roll"
                      className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider"
                    >
                      KCC Student Roll Number <span className="text-[#DC2626]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSampleCard(true)}
                      className="flex items-center gap-1.5 font-mono-code text-[11px] text-[#1D4ED8] hover:text-[#111215] transition-colors cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      View sample ID
                    </button>
                  </div>
                  <input
                    id="register-roll"
                    type="text"
                    required
                    value={form.kccId}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      update('kccId', val);
                      if (rollError && val.length === 13 && /^\d{13}$/.test(val)) {
                        setRollError('');
                      }
                    }}
                    onBlur={() => validateRoll(form.kccId)}
                    placeholder="e.g. 2504920100231"
                    className={`w-full bg-[#FBF9F5] border ${
                      rollError ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#CFC7BB] focus:border-[#111215]'
                    } focus:bg-white text-sm text-[#111215] px-3.5 py-2.5 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]`}
                  />
                  {rollError ? (
                    <p className="mt-1.5 font-mono-code text-xs text-[#DC2626] flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{rollError}</span>
                    </p>
                  ) : (
                    <p className="mt-1.5 font-mono-code text-[11px] text-[#98948C]">
                      13-digit university roll number as printed on your KCC ID card
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                      Year of Study <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      required
                      value={form.year}
                      onChange={(e) => update('year', e.target.value)}
                      className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3 py-2.5 rounded-none outline-none transition-colors font-mono-code"
                    >
                      <option value="">Select year</option>
                      {COLLEGE_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                      Section <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      required
                      value={form.section}
                      onChange={(e) => {
                        update('section', e.target.value);
                        update('subSection', '');
                      }}
                      className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3 py-2.5 rounded-none outline-none transition-colors font-mono-code"
                    >
                      <option value="">Select section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                </div>

                {/* Sub-section — slides in once A or B is chosen */}
                <div
                  style={{
                    maxHeight: form.section && SECTION_SUBS[form.section] ? '120px' : '0',
                    opacity: form.section && SECTION_SUBS[form.section] ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.35s ease, opacity 0.25s ease',
                  }}
                >
                  <div className="pt-1">
                    <label className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                      Sub-Section <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      required={!!(form.section && SECTION_SUBS[form.section])}
                      value={form.subSection}
                      onChange={(e) => update('subSection', e.target.value)}
                      className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3 py-2.5 rounded-none outline-none transition-colors font-mono-code"
                    >
                      <option value="">Select sub-section</option>
                      {(SECTION_SUBS[form.section] ?? []).map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                    Class / Programme <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    required
                    value={form.className}
                    onChange={(e) => update('className', e.target.value)}
                    className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3 py-2.5 rounded-none outline-none transition-colors font-mono-code"
                  >
                    <option value="">Select your course / programme</option>
                    <optgroup label="B.Tech Programmes (KCC ITM — AKTU)">
                      {KCC_PROGRAMMES.slice(0, 10).map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Postgraduate Programmes (KCC ITM — AKTU)">
                      {KCC_PROGRAMMES.slice(10, 14).map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </optgroup>
                    <optgroup label="UG & Law Programmes (KCC ILHE — IPU)">
                      {KCC_PROGRAMMES.slice(14).map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                    Classroom Number <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.classroomNumber}
                    onChange={(e) => update('classroomNumber', e.target.value)}
                    placeholder="e.g. Room 302, Block B or ME-104"
                    className="w-full bg-[#FBF9F5] border border-[#CFC7BB] focus:border-[#111215] focus:bg-white text-sm text-[#111215] px-3.5 py-2.5 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]"
                  />
                  <p className="mt-1 font-mono-code text-[11px] text-[#98948C]">
                    Your primary lecture hall or classroom number (required)
                  </p>
                </div>

                {/* ── ACCOUNT CREDENTIALS ── */}
                <div className="pt-2 border-t border-[#E5DFD5]">
                  <p className="font-mono-code text-[11px] font-semibold text-[#65625D] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Account Credentials
                  </p>

                  {/* Email */}
                  <div className="mb-4">
                    <label
                      htmlFor="register-email"
                      className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5"
                    >
                      Email Address <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => {
                        update('email', e.target.value);
                        if (emailError) validateEmail(e.target.value);
                      }}
                      onBlur={() => validateEmail(form.email)}
                      placeholder="rahul.kcc@gmail.com"
                      className={`w-full bg-[#FBF9F5] border ${
                        emailError ? 'border-[#DC2626]' : 'border-[#CFC7BB] focus:border-[#111215]'
                      } focus:bg-white text-sm text-[#111215] px-3.5 py-2.5 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]`}
                    />
                    {emailError && (
                      <p className="mt-1.5 font-mono-code text-xs text-[#DC2626] flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />{emailError}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label
                      htmlFor="register-password"
                      className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5"
                    >
                      Choose a Password <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="register-password"
                        type={showPass ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={form.password}
                        onChange={(e) => {
                          update('password', e.target.value);
                          if (passwordError) validatePassword(e.target.value);
                          if (confirmError && confirmPassword) validateConfirm(confirmPassword);
                        }}
                        onBlur={() => validatePassword(form.password)}
                        placeholder="Minimum 8 characters"
                        className={`w-full bg-[#FBF9F5] border ${
                          passwordError ? 'border-[#DC2626]' : 'border-[#CFC7BB] focus:border-[#111215]'
                        } focus:bg-white text-sm text-[#111215] px-3.5 py-2.5 pr-10 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65625D] hover:text-[#111215] cursor-pointer"
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {form.password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((lvl) => (
                            <div
                              key={lvl}
                              className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: pwStrength >= lvl ? strengthColors[pwStrength] : '#E5DFD5',
                              }}
                            />
                          ))}
                        </div>
                        <p className="font-mono-code text-[11px]" style={{ color: strengthColors[pwStrength] }}>
                          {strengthLabels[pwStrength]} password
                        </p>
                      </div>
                    )}
                    {passwordError && (
                      <p className="mt-1.5 font-mono-code text-xs text-[#DC2626] flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />{passwordError}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="register-confirm-password"
                      className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider mb-1.5"
                    >
                      Confirm Password <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="register-confirm-password"
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (confirmError) validateConfirm(e.target.value);
                        }}
                        onBlur={() => validateConfirm(confirmPassword)}
                        placeholder="Re-enter your password"
                        className={`w-full bg-[#FBF9F5] border ${
                          confirmError
                            ? 'border-[#DC2626]'
                            : confirmPassword && confirmPassword === form.password
                            ? 'border-[#15803D]'
                            : 'border-[#CFC7BB] focus:border-[#111215]'
                        } focus:bg-white text-sm text-[#111215] px-3.5 py-2.5 pr-10 rounded-none outline-none transition-colors font-mono-code placeholder:text-[#98948C]`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65625D] hover:text-[#111215] cursor-pointer"
                        aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmError ? (
                      <p className="mt-1.5 font-mono-code text-xs text-[#DC2626] flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />{confirmError}
                      </p>
                    ) : confirmPassword && confirmPassword === form.password ? (
                      <p className="mt-1.5 font-mono-code text-xs text-[#15803D] flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 shrink-0" />Passwords match
                      </p>
                    ) : null}
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-xs font-mono-code text-[#B91C1C] bg-red-50 border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const isMobileValid = validateMobile(form.mobileNumber);
                    const isRollValid = validateRoll(form.kccId);
                    const isEmailValid = validateEmail(form.email);
                    const isPasswordValid = validatePassword(form.password);
                    const isConfirmValid = validateConfirm(confirmPassword);

                    if (!form.fullName || !form.mobileNumber || !form.kccId || !form.year || !form.section || !form.subSection || !form.className || !form.classroomNumber) {
                      setError('Please complete all required fields including mobile number, sub-section, and classroom number.');
                      return;
                    }

                    if (!isMobileValid || !isRollValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
                      setError('Please correct the highlighted errors before proceeding.');
                      return;
                    }

                    setError('');
                    setStep(2);
                  }}
                  className="w-full mt-4 bg-[#111215] hover:bg-[#1D4ED8] text-[#FBF9F5] font-semibold py-3.5 px-4 text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 tracking-tight"
                >
                  Proceed to ID Verification
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                {/* Credential summary (read-only, reassuring) */}
                <div className="bg-[#F3EFE8] border border-[#E5DFD5] px-4 py-3 flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-[#15803D] shrink-0" />
                  <div>
                    <p className="font-mono-code text-xs font-bold text-[#111215]">{form.email}</p>
                    <p className="font-mono-code text-[11px] text-[#65625D]">Account email confirmed — password set</p>
                  </div>
                </div>

                {/* ID Card Attachment */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-mono-code text-xs font-semibold text-[#111215] uppercase tracking-wider">
                      KCC Student ID Card Photo
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSampleCard(true)}
                      className="flex items-center gap-1.5 font-mono-code text-[11px] text-[#1D4ED8] hover:text-[#111215] transition-colors cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      View sample
                    </button>
                  </div>
                  <div className="border border-dashed border-[#CFC7BB] bg-[#FBF9F5] p-5 text-center transition-colors hover:border-[#111215]">
                    <input
                      type="file"
                      id="id-card-photo"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={(e) => setIdCardFile(e.target.files?.[0] ?? null)}
                    />
                    <label htmlFor="id-card-photo" className="cursor-pointer block">
                      {idCardFile ? (
                        <div className="space-y-1 font-mono-code text-xs text-[#15803D]">
                          <Check className="h-5 w-5 mx-auto text-[#15803D]" />
                          <p className="font-bold truncate max-w-xs mx-auto">{idCardFile.name}</p>
                          <p className="text-[11px] text-[#65625D]">Click to replace file</p>
                        </div>
                      ) : (
                        <div className="space-y-1 font-mono-code text-xs text-[#65625D]">
                          <Upload className="h-5 w-5 mx-auto text-[#111215]" />
                          <p className="font-bold text-[#111215]">Attach photo of your KCC ID card</p>
                          <p className="text-[11px]">JPG or PNG · Used solely for college eligibility verification</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="mt-1.5 font-mono-code text-[11px] text-[#98948C]">
                    Must clearly show your roll number, name, course, and KCC ITM header.
                  </p>
                </div>

                {error && (
                  <div className="p-3 text-xs font-mono-code text-[#B91C1C] bg-red-50 border border-red-200">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className="px-4 py-3.5 border border-[#CFC7BB] hover:border-[#111215] text-[#111215] font-mono-code text-xs uppercase tracking-wider"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#111215] hover:bg-[#1D4ED8] disabled:opacity-50 text-[#FBF9F5] font-semibold py-3.5 px-4 text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 tracking-tight"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5DFD5] text-center text-xs text-[#65625D]">
            Already registered?{' '}
            <Link
              href="/login"
              className="font-bold text-[#111215] hover:text-[#1D4ED8] underline underline-offset-2"
            >
              Log in to your account
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
