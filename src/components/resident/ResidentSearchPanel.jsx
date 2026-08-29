import { useTranslation } from 'react-i18next';
import SearchInput from '../ui/SearchInput.jsx';
import ResidentSearchCard from './ResidentSearchCard.jsx';
import { ResidentSearchSkeleton } from '../ui/Skeleton.jsx';

export default function ResidentSearchPanel({
  query,
  onQueryChange,
  onSearch,
  records,
  searching,
  searched,
  onSelect,
  disableRegistered = false,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{t('resident.progressiveSearchHint')}</p>
      <SearchInput
        value={query}
        onChange={onQueryChange}
        onSearch={onSearch}
        placeholder={t('resident.searchPlaceholder')}
      />
      {searching && <ResidentSearchSkeleton count={2} />}

      {!searching && searched && records.length === 0 && (
        <p className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {t('resident.notInData')}
        </p>
      )}
      {!searching && records.length > 0 && (
        <div className="space-y-3">
          {records.map((record) => (
            <ResidentSearchCard
              key={record.id}
              resident={record}
              onSelect={onSelect}
              disabled={disableRegistered && record.isRegistered}
            />
          ))}
        </div>
      )}
    </div>
  );
}
