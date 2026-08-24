import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Upload,
  Database,
  BadgeCheck,
  Users,
  Shield,
  Footprints,
  Ticket,
  ChartColumn,
  TriangleAlert,
  Bell,
  LogOut,
  Waves,
  Sliders,
  MapPin,
  History,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';

const links = [
  { to: '/master/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/master/activity-logs', labelKey: 'Activity Logs', icon: History },
  { to: '/master/features', labelKey: 'Feature Controls', icon: Sliders },
  { to: '/master/track-user', labelKey: 'Track User', icon: MapPin },
  { to: '/master/import', labelKey: 'nav.import', icon: Upload },
  { to: '/master/resident-records', labelKey: 'nav.residentRecords', icon: Database },
  { to: '/master/registered-residents', labelKey: 'nav.registeredResidents', icon: BadgeCheck },
  { to: '/master/admins', labelKey: 'nav.admins', icon: Shield },
  { to: '/master/resident-entries', labelKey: 'nav.residentEntries', icon: Footprints },
  { to: '/master/visitor-entries', labelKey: 'nav.visitorEntries', icon: Ticket },
  { to: '/master/analytics', labelKey: 'nav.analytics', icon: ChartColumn },
  { to: '/master/notifications', labelKey: 'nav.notifications', icon: Bell },
  { to: '/master/reports', labelKey: 'nav.reports', icon: TriangleAlert },
];

export default function MasterSidebar({ isOpen = false, onClose = () => {} }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { featureSettings } = useFeatureSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navContent = (
    <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300">
      <div className="flex items-center justify-between border-b border-zinc-800 p-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
            <Waves className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-white">{t('app.title')}</h1>
            <p className="truncate text-[11px] text-zinc-500">{t('app.subtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
          aria-label="Close Sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links
          .filter((link) => !link.featureKey || featureSettings[link.featureKey])
          .map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-300'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="truncate">{link.labelKey.startsWith('nav.') ? t(link.labelKey) : link.labelKey}</span>
              </NavLink>
            );
          })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
          {t('common.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen max-h-screen shrink-0 md:flex">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10 flex h-full max-w-full">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
