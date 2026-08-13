import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../language/LanguageSwitcher.jsx';

export default function MobileHeader({ title, showLanguage = false, action = null }) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4">
      <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-3">
        <Link to="/user/home" className="min-w-0 flex-1 text-left">
          <h1 className="truncate text-base font-bold text-gray-900 sm:text-lg">{title}</h1>
          <p className="truncate text-[11px] text-gray-500 sm:text-xs">{t('app.subtitle')}</p>
        </Link>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {showLanguage && <LanguageSwitcher />}
          {action}
        </div>
      </div>
    </header>
  );
}
