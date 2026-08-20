import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import Button from './Button.jsx';

export default function SearchInput({ value, onChange, onSearch, placeholder }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1 min-w-0">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
          placeholder={placeholder || t('common.search')}
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-400 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 shadow-sm"
        />
      </div>
      <Button type="button" onClick={onSearch} className="w-full shrink-0 px-5 sm:w-auto">
        {t('common.search')}
      </Button>
    </div>
  );
}
