import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, RefreshCw, CheckCircle2, ShieldCheck, ArrowLeft, Edit2 } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import PhotoPicker from './PhotoPicker.jsx';

export default function ResidentOtpVerificationScreen({
  resident,
  phone,
  flowType = 'login', // 'login' | 'register'
  onVerify,
  onResendOtp,
  onChangePhone,
  loading,
  error,
}) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');
  const [photo, setPhoto] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [localError, setLocalError] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const timerRef = useRef(null);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
      setResendSuccess('New OTP sent to your WhatsApp!');
      setOtp('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setLocalError(msg);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!otp || otp.trim().length < 6) {
      setLocalError('Please enter the complete 6-digit OTP code');
      return;
    }
    if (flowType === 'register') {
      onVerify({ phone, photo, otp: otp.trim() });
    } else {
      onVerify({ phone, otp: otp.trim() });
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm transition-colors space-y-5">
      {/* Header with back to phone change */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={onChangePhone}
          disabled={loading || resending}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Change Number</span>
        </button>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <MessageSquare className="h-3 w-3" />
          WhatsApp Verification
        </span>
      </div>

      {/* Resident Info Badge */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 p-4 text-sm text-gray-700 dark:text-slate-300 space-y-1">
        <p className="font-bold text-base text-gray-900 dark:text-white">{resident.name}</p>
        <div className="flex flex-wrap gap-x-4 text-xs text-slate-600 dark:text-slate-400">
          <span>🏠 {resident.houseName || '—'}</span>
          {resident.ward && <span>📍 Ward {resident.ward}</span>}
          {resident.guardianName && <span>👤 S/O {resident.guardianName}</span>}
        </div>
      </div>

      {/* Sent notification note */}
      <div className="text-center space-y-1">
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Enter Verification Code
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
          <span>We sent a 6-digit code to WhatsApp:</span>
          <strong className="text-slate-800 dark:text-slate-200 font-mono">+91 {phone}</strong>
          <button
            type="button"
            onClick={onChangePhone}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 ml-1"
            title="Edit Phone"
          >
            <Edit2 className="h-3 w-3 inline" />
          </button>
        </p>
      </div>

      {/* Success banner */}
      {resendSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{resendSuccess}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              6-Digit WhatsApp OTP
            </label>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                timeLeft < 30
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              ⏱️ {formatTimer(timeLeft)}
            </span>
          </div>

          <Input
            type="text"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="• • • • • •"
            className="text-center tracking-widest text-xl sm:text-2xl font-mono font-extrabold py-3 shadow-inner bg-slate-50/50 dark:bg-slate-800/50"
            required
            autoFocus
          />

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {timeLeft > 0 ? 'Code expires in ' + formatTimer(timeLeft) : 'Code expired'}
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
                  <span>Resending...</span>
                </>
              ) : (
                <span>Resend OTP on WhatsApp</span>
              )}
            </button>
          </div>
        </div>

        {/* Photo picker if registering */}
        {flowType === 'register' && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Pass Photo (Optional)
            </label>
            <PhotoPicker onSelect={setPhoto} />
          </div>
        )}

        {/* 5-Day session reassurance badge */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-3 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>You will stay logged in for <strong>5 days</strong> on this device.</span>
        </div>

        {/* Error message */}
        {(localError || error) && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center animate-shake">
            {localError || error}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading || otp.length < 6 || timeLeft === 0}
          className="w-full py-3.5 text-base sm:py-4 sm:text-lg font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading
            ? t('common.loading', 'Verifying...')
            : flowType === 'register'
            ? t('resident.createPass', 'Verify & Create Pass')
            : t('resident.showQrPass', 'Verify & Show Pass')}
        </Button>
      </form>
    </div>
  );
}
