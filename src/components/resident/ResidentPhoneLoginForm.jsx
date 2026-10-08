import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRound } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { getGenderPlaceholder } from './ResidentSearchCard.jsx';

export default function ResidentPhoneLoginForm({ resident, onSubmit, loading, error }) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [imageError, setImageError] = useState(false);

  const genderPlaceholder = getGenderPlaceholder(resident.gender);
  const photoSrc = !imageError && resident.photoUrl ? resident.photoUrl : genderPlaceholder;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ phone });
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 shadow-sm transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('resident.enterPassword')}</h3>
      <div className="mt-3 flex gap-3.5 items-center rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 p-4 text-sm text-gray-700 dark:text-slate-300">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={resident.name}
            onError={() => setImageError(true)}
            className="h-16 w-16 shrink-0 rounded-xl object-cover border border-blue-200 dark:border-blue-800"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <UserRound className="h-7 w-7" strokeWidth={1.75} />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold text-gray-900 dark:text-white text-base leading-snug">{resident.name}</p>
          <p className="text-xs text-gray-600 dark:text-slate-400">
            {t('resident.fatherName')}: <span className="font-medium text-gray-800 dark:text-slate-200">{resident.guardianName || '—'}</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-slate-400">
            {t('resident.houseName')}: <span className="font-medium text-gray-800 dark:text-slate-200">{resident.houseName || '—'}</span>
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label={t('resident.passwordLabel')}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('resident.passwordPlaceholder')}
          className="placeholder:text-sm"
          required
        />
        <p className="text-xs text-gray-500">{t('resident.phoneAsPassword')}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full py-3.5 text-base sm:py-4 sm:text-lg">
          {loading ? t('common.loading') : t('resident.showQrPass')}
        </Button>
      </form>
    </div>
  );
}
