import { useTranslation } from 'react-i18next';
import Button from './Button.jsx';

export default function SearchInput({ value, onChange, onSearch, placeholder }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
        placeholder={placeholder || t('common.search')}
        className="min-w-0 w-full flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      <Button type="button" onClick={onSearch} className="w-full shrink-0 px-5 py-3 sm:w-auto">
        {t('common.search')}
      </Button>
    </div>
  );
}
