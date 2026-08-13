import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';

export default function ResidentSearchCard({ resident, onSelect, disabled = false }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug text-gray-900 sm:text-lg">{resident.name}</h3>
        {resident.isRegistered && (
          <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700 sm:text-xs">
            {t('resident.alreadyRegistered')}
          </span>
        )}
      </div>
      <dl className="mt-3 space-y-2 text-sm text-gray-600">
        <div>
          <dt className="inline font-medium">{t('resident.fatherName')}: </dt>
          <dd className="inline">{resident.guardianName || '—'}</dd>
        </div>
        <div>
          <dt className="inline font-medium">{t('resident.houseName')}: </dt>
          <dd className="inline">{resident.houseName || '—'}</dd>
        </div>
        <div>
          <dt className="inline font-medium">{t('resident.gender')}: </dt>
          <dd className="inline">{resident.gender || '—'}</dd>
        </div>
      </dl>
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
