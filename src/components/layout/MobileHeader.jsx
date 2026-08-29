import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import LanguageSwitcher from '../language/LanguageSwitcher.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';

export default function MobileHeader({ title, showLanguage = true, action = null, targetRole = 'user' }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { featureSettings, toggleThemeMode } = useFeatureSettings() || {};
  const isDark = featureSettings?.appearance?.themeMode === 'dark';

  const homeLink = (user?.role === 'ADMIN' || targetRole === 'admin')
    ? '/admin/search'
    : (user?.role === 'MASTER_ADMIN' || targetRole === 'master')
    ? '/master/dashboard'
    : '/user/home';

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-3 shadow-2xs sm:px-4 sm:py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <Link to={homeLink} className="min-w-0 flex-1 text-left">
          <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">{title}</h1>
          <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('app.subtitle')}</p>
        </Link>
        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          {showLanguage && <LanguageSwitcher />}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-amber-400 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NotificationBell targetRole={targetRole} />
          {action}
        </div>
      </div>
    </header>
  );
}
