import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScanLine, Search } from 'lucide-react';
import AdminPendingVisitorAlert from './AdminPendingVisitorAlert.jsx';
import { FloatingDock } from '../ui/floating-dock.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';

export default function BottomNavigation({ items }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const navComp = Array.isArray(appearance.components) ? appearance.components.find((c) => c.id === 'nav') : null;
  const isAdminNavigation = items.some((item) => item.to?.startsWith('/admin'));
  const dockStyle = isAdminNavigation
    ? appearance.adminDockStyle || 'flush'
    : appearance.userDockStyle || appearance.dockStyle || navComp?.style || 'floating';
  const isFlush = dockStyle === 'flush';

  const formattedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      title: t(item.labelKey, item.to.split('/').pop()),
    }));
  }, [items, t]);

  if (!user) {
    return null;
  }

  const showScanFab = isAdminNavigation && location.pathname !== '/admin/scan';
  const showSearchFab = isAdminNavigation && location.pathname !== '/admin/search';
  const hasFloatingButtons = showScanFab || showSearchFab;

  return (
    <nav
      className={`absolute bottom-0 inset-x-0 z-50 w-full flex flex-col items-center justify-end pointer-events-none select-none ${
        isFlush
          ? 'px-0 pt-0 pb-0'
          : 'px-3 pt-1 pb-[calc(max(0.75rem,env(safe-area-inset-bottom))+6px)] sm:pb-4'
      }`}
    >
      {isAdminNavigation && <AdminPendingVisitorAlert />}

      {/* Floating Action Buttons Stack (Independent Absolute Positioning so dock hover never shifts it) */}
      {hasFloatingButtons && (
        <div className="w-full max-w-lg mx-auto absolute bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+96px)] sm:bottom-28 inset-x-0 flex flex-col items-end gap-2.5 px-3 pointer-events-none">
          {/* Top Search Button */}
          {showSearchFab && (
            <Link
              to="/admin/search"
              aria-label={t('nav.search') || 'Search Resident'}
              className="pointer-events-auto flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full text-white ring-3 ring-white dark:ring-slate-900 active:scale-90 hover:scale-105 transition-all duration-200 z-50 group"
              style={{
                backgroundColor: appearance.accentSecondary || '#0ea5e9',
                boxShadow: `0 8px 25px ${appearance.glowColor || 'rgba(2,132,199,0.45)'}`,
              }}
            >
              <Search className="h-5 w-5 sm:h-5.5 sm:w-5.5 stroke-[2.4] transition-transform group-hover:scale-110" />
              <span className="sr-only">Search</span>
            </Link>
          )}

          {/* Bottom Scan Button */}
          {showScanFab && (
            <Link
              to="/admin/scan"
              aria-label={t('nav.scan') || 'Scan Pass'}
              className="pointer-events-auto flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full text-white ring-3 ring-white dark:ring-slate-900 active:scale-90 hover:scale-105 transition-all duration-200 z-50 group"
              style={{
                backgroundColor: appearance.accentColor || '#0284C7',
                boxShadow: `0 8px 25px ${appearance.glowColor || 'rgba(2,132,199,0.45)'}`,
              }}
            >
              <ScanLine className="h-6 w-6 stroke-[2.3] transition-transform group-hover:scale-110" />
              <span className="sr-only">Scan</span>
            </Link>
          )}
        </div>
      )}

      <FloatingDock items={formattedItems} />
    </nav>
  );
}
