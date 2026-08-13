import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminPendingVisitorAlert from './AdminPendingVisitorAlert.jsx';

export default function BottomNavigation({ items }) {
  const { t } = useTranslation();
  const isAdminNavigation = items.some((item) => item.to === '/admin/scan');

  return (
    <>
      {isAdminNavigation && <AdminPendingVisitorAlert />}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white shadow-lg">
        <div className="mx-auto flex max-w-lg gap-0.5 overflow-x-auto px-1 py-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-w-0 flex-1 flex-col items-center rounded-xl px-1 py-2 text-[10px] font-medium leading-tight sm:min-w-[4.5rem] sm:px-2 sm:text-xs ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                  }`
                }
              >
                {Icon ? <Icon className="h-5 w-5 shrink-0" strokeWidth={2} /> : null}
                <span className="mt-1 max-w-full text-center break-words">{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
