import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminPendingVisitorAlert from './AdminPendingVisitorAlert.jsx';

import { useAuth } from '../../context/AuthContext.jsx';

export default function BottomNavigation({ items }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isAdminNavigation = items.some((item) => item.to === '/admin/scan');
  const count = items.length;

  return (
    <nav className="relative sticky bottom-0 left-0 right-0 z-40 shrink-0 w-full border-t border-gray-200/80 bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 pb-safe">
      {isAdminNavigation && <AdminPendingVisitorAlert />}
      <div
        className={`mx-auto grid max-w-lg items-center px-1 py-1.5 ${
          count === 6
            ? 'grid-cols-6'
            : count === 5
            ? 'grid-cols-5'
            : count === 4
            ? 'grid-cols-4'
            : 'grid-cols-5'
        }`}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-xl py-1 px-0.5 text-[9.5px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`
              }
            >
              {Icon ? <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2.2} /> : null}
              <span className="mt-0.5 text-center truncate max-w-full leading-tight">
                {t(item.labelKey, item.to.split('/').pop())}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
