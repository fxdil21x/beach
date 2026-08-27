import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdminPendingVisitorAlert from './AdminPendingVisitorAlert.jsx';
import { FloatingDock } from '../ui/floating-dock.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BottomNavigation({ items }) {
  const { t } = useTranslation();
  const { user } = useAuth();

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

  return (
    <nav className="sticky bottom-0 inset-x-0 z-50 shrink-0 w-full flex flex-col items-center justify-end px-3 pt-1 pb-[calc(max(1rem,env(safe-area-inset-bottom))+8px)] sm:pb-5 pointer-events-none select-none">
      {isAdminNavigation && <AdminPendingVisitorAlert />}
      <FloatingDock items={formattedItems} />
    </nav>
  );
}
