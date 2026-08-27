import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScanLine } from 'lucide-react';
import AdminPendingVisitorAlert from './AdminPendingVisitorAlert.jsx';
import { FloatingDock } from '../ui/floating-dock.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BottomNavigation({ items }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const formattedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      title: t(item.labelKey, item.to.split('/').pop()),
    }));
  }, [items, t]);

  if (!user) {
    return null;
  }

  const isAdminNavigation = items.some((item) => item.to === '/admin/scan');
  const showScanFab = isAdminNavigation && location.pathname !== '/admin/scan';

  return (
    <nav className="sticky bottom-0 inset-x-0 z-50 shrink-0 w-full flex flex-col items-center justify-end px-3 pt-1 pb-[calc(max(1rem,env(safe-area-inset-bottom))+8px)] sm:pb-5 pointer-events-none select-none">
      {isAdminNavigation && <AdminPendingVisitorAlert />}

      {/* WhatsApp-style Floating Sticky Scan Button (Bottom Right) */}
      {showScanFab && (
        <div className="w-full max-w-lg mx-auto relative flex justify-end">
          <Link
            to="/admin/scan"
            aria-label={t('nav.scan') || 'Scan Pass'}
            className="pointer-events-auto absolute right-1 sm:right-2 -top-36 flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_8px_25px_rgba(37,99,235,0.45)] ring-3 ring-white dark:ring-slate-900 active:scale-90 hover:scale-105 transition-all duration-200 z-50 group"
          >
            <ScanLine className="h-6 w-6 stroke-[2.3] transition-transform group-hover:scale-110" />
            <span className="sr-only">Scan</span>
          </Link>
        </div>
      )}

      <FloatingDock items={formattedItems} />
    </nav>
  );
}
