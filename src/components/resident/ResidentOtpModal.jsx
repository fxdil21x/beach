import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, RefreshCw, CheckCircle2, X, Edit2, KeyRound, Smartphone } from 'lucide-react';
import Button from '../ui/Button.jsx';
import PhotoPicker from './PhotoPicker.jsx';
import { confirmFirebaseOtp } from '../../config/firebase.js';

export default function ResidentOtpModal({
  isOpen,
  onClose,
  resident,
  phone,
  devOtp,
  flowType = 'login', // 'login' | 'register'
  onVerify,
  onResendOtp,
  onChangePhone,
  loading,
  error,
}) {
  const { t } = useTranslation();
  // 6 individual digit states
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [photo, setPhoto] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [localError, setLocalError] = useState('');
  const [verifyingFirebase, setVerifyingFirebase] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes (120s)
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isOpen, timeLeft]);

  // Focus first digit when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setLocalError('');
      setResendSuccess('');
      setTimeLeft(120);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAutoFillDevOtp = (codeToFill) => {
    if (!codeToFill) return;
    const splitDigits = String(codeToFill).slice(0, 6).split('');
    const newDigits = ['', '', '', '', '', ''];
    splitDigits.forEach((d, i) => {
      newDigits[i] = d;
    });
    setDigits(newDigits);
    inputRefs.current[5]?.focus();
  };

  const handleDigitChange = (index, value) => {
    // Handle paste of full 6-digit code
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const singleDigit = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    setDigits(newDigits);

    // Auto-advance to next box if digit entered
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const newDigits = [...digits];
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setDigits(newDigits);
    const nextIdx = Math.min(pasteData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleResend = async () => {
    if (timeLeft > 0 || resending) return;
    setResending(true);
    setLocalError('');
    setResendSuccess('');
    try {
      if (onResendOtp) {
        await onResendOtp(phone);
      }
      setTimeLeft(120);
      setDigits(['', '', '', '', '', '']);
      setResendSuccess('New SMS OTP sent to your phone number!');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setLocalError(msg);
    } finally {
      setResending(false);
    }
  };

  const fullOtp = digits.join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (fullOtp.length < 6) {
      setLocalError('Please enter the complete 6-digit OTP code');
      return;
    }

    setVerifyingFirebase(true);
    try {
      // If Firebase Phone Auth has an active session, verify client-side as well
      if (window.confirmationResult) {
        try {
          await confirmFirebaseOtp(fullOtp);
          console.log('[SMS OTP] Firebase Phone Auth verified successfully');
        } catch (fbErr) {
          console.warn('[SMS OTP] Firebase confirmation notice:', fbErr.message);
          // If Firebase rejects code, check if it's invalid
          if (fbErr.code === 'auth/invalid-verification-code') {
            setLocalError('Invalid OTP code. Please check SMS and enter again.');
            setVerifyingFirebase(false);
            return;
          }
        }
      }

      if (flowType === 'register') {
        onVerify({ phone, photo, otp: fullOtp });
      } else {
        onVerify({ phone, otp: fullOtp });
      }
    } finally {
      setVerifyingFirebase(false);
    }
  };

  const isBusy = loading || verifyingFirebase;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xl transition-all space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close / Change Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy || resending}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-inner">
            <Smartphone className="h-6 w-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            SMS OTP Verification
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 flex-wrap">
            <span>6-digit OTP sent to:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">+91 {phone}</span>
            <button
              type="button"
              onClick={onChangePhone}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-0.5 cursor-pointer"
            >
              <Edit2 className="h-3 w-3 inline" />
              <span>Change</span>
            </button>
          </p>
        </div>

        {/* Resident Summary Badge */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 p-3.5 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{resident.name}</p>
            <p className="text-slate-500 dark:text-slate-400 truncate">
              {resident.houseName || 'Resident'} {resident.ward ? `· Ward ${resident.ward}` : ''}
            </p>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
            {flowType === 'register' ? 'Register' : 'Login'}
          </span>
        </div>

        {/* Dev / Test OTP Pill (Instant test helper) */}
        {devOtp && (
          <button
            type="button"
            onClick={() => handleAutoFillDevOtp(devOtp)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 p-2.5 text-xs font-mono font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100/80 transition-all cursor-pointer shadow-xs"
            title="Click to auto-fill code"
          >
            <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>🔑 OTP: <strong>{devOtp}</strong> (Tap to auto-fill)</span>
          </button>
        )}

        {/* Resend Success Alert */}
        {resendSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{resendSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 6 Digit Square Boxes (Columns) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Enter 6-Digit Code
              </label>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${
                  timeLeft < 30
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                ⏱️ {formatTimer(timeLeft)}
              </span>
            </div>

            {/* 6 Grid Columns */}
            <div className="grid grid-cols-6 gap-2 sm:gap-2.5" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isBusy || timeLeft === 0}
                  className={`w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-extrabold rounded-xl border transition-all outline-none ${
                    digit
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 text-slate-900 dark:text-white shadow-xs'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-400'
                  } focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20`}
                />
              ))}
            </div>

            {/* Resend Action */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {timeLeft > 0 ? `Expires in ${formatTimer(timeLeft)}` : 'OTP expired'}
              </span>
              <button
                type="button"
                disabled={timeLeft > 0 || resending}
                onClick={handleResend}
                className={`font-semibold flex items-center gap-1 transition-colors ${
                  timeLeft > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 underline cursor-pointer'
                }`}
              >
                {resending ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Resending SMS...</span>
                  </>
                ) : (
                  <span>Resend SMS OTP</span>
                )}
              </button>
            </div>
          </div>

          {/* Photo Picker for registration */}
          {flowType === 'register' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Pass Photo (Optional)
              </label>
              <PhotoPicker onSelect={setPhoto} />
            </div>
          )}

          {/* 5-Day Stay Logged in Badge */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-3 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Pass access remains valid for <strong>5 days</strong> on this device.</span>
          </div>

          {/* Error Banner */}
          {(localError || error) && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center animate-shake">
              {localError || error}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isBusy || fullOtp.length < 6 || timeLeft === 0}
            className="w-full py-3.5 text-base sm:py-4 sm:text-lg font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            {isBusy
              ? t('common.loading', 'Verifying...')
              : flowType === 'register'
              ? t('resident.createPass', 'Verify & Create Pass')
              : t('resident.showQrPass', 'Verify & Show Pass')}
          </Button>
        </form>
      </div>
    </div>
  );
}
