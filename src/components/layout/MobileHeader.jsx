import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../language/LanguageSwitcher.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MobileHeader({ title, showLanguage = true, action = null, targetRole = 'user' }) {
  const { t } = useTranslation();
  const { user } = useAuth();

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
          <NotificationBell targetRole={targetRole} />
          {action}
        </div>
      </div>
    </header>
  );
}
