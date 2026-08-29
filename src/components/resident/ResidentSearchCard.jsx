import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';
import menImage from '../../pages/public/image/men.jpg';
import womenImage from '../../pages/public/image/women.jpg';

function getGenderPlaceholder(gender) {
  const value = (gender || '').trim().toUpperCase();
  if (value === 'F' || value === 'FEMALE') return womenImage;
  if (value === 'M' || value === 'MALE') return menImage;
  return null;
}

export default function ResidentSearchCard({ resident, onSelect, disabled = false }) {
  const { t } = useTranslation();
  const genderPlaceholder = getGenderPlaceholder(resident.gender);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm transition-colors">
      <div className="flex gap-3">
        {genderPlaceholder && (
          <img
            src={genderPlaceholder}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug text-gray-900 dark:text-white sm:text-lg">{resident.name}</h3>
            {resident.isRegistered && (
              <span className="shrink-0 rounded-full bg-green-100 dark:bg-green-950/60 border border-green-200 dark:border-green-800/40 px-2 py-1 text-[10px] font-medium text-green-700 dark:text-green-400 sm:text-xs">
                {t('resident.alreadyRegistered')}
              </span>
            )}
          </div>
          <dl className="mt-3 space-y-2 text-sm text-gray-600 dark:text-slate-400">
            <div>
              <dt className="inline font-medium">{t('resident.fatherName')}: </dt>
              <dd className="inline text-gray-800 dark:text-slate-200">{resident.guardianName || '—'}</dd>
            </div>
            <div>
              <dt className="inline font-medium">{t('resident.houseName')}: </dt>
              <dd className="inline text-gray-800 dark:text-slate-200">{resident.houseName || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
      <Button
        onClick={() => onSelect(resident)}
        disabled={disabled}
        className="mt-4 w-full"
      >
        {t('resident.selectRecord')}
      </Button>
    </div>
  );
}
