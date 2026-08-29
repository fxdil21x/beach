import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Mail, Shield, Globe, LogOut, CheckCircle2, User } from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import Button from '../../components/ui/Button.jsx';
import LanguageSwitcher from '../../components/language/LanguageSwitcher.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';
import { adminNav } from '../../config/navigation.js';

export default function AdminProfile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const accentColor = appearance.accentColor || '#0284C7';
  const glowColor = appearance.glowColor || 'rgba(2, 132, 199, 0.35)';

  const adminEmail = user?.email || (user?.username ? `${user.username}@beachverification.com` : 'admin@beachverification.com');

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors">
      <MobileHeader title={t('nav.profile', 'Profile')} targetRole="admin" />

      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-6 pb-28">
        {/* 1. Admin Identity Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-100 dark:border-slate-800 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-13 w-13 items-center justify-center rounded-2xl text-white font-bold text-lg shadow-sm"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 4px 14px ${glowColor}`,
                }}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : <Shield className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">@{user?.username || 'admin'}</p>
              </div>
            </div>

            <span
              className="rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wider border"
              style={{
                backgroundColor: `${accentColor}12`,
                color: accentColor,
                borderColor: `${accentColor}30`,
              }}
            >
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>

        {/* 2. Admin Email Card with Action Button */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-100 dark:border-slate-800 space-y-3 transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            <Mail className="h-4 w-4" style={{ color: accentColor }} />
            <span>Admin Email</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{adminEmail}</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">Official gate operations communication</p>
            </div>

            <a
              href={`mailto:${adminEmail}`}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 4px 14px ${glowColor}`,
              }}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Send Email</span>
            </a>
          </div>
        </div>

        {/* 3. App Language Preferences Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">{t('profile.language', 'App Language')}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{t('profile.selectLanguage', 'Select your preferred language')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* 4. Logout Action */}
        <Button
          variant="secondary"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="w-full py-4 text-sm font-bold gap-2 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/60 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('common.logout', 'Logout')}</span>
        </Button>
      </main>

      <BottomNavigation items={adminNav} />
    </div>
  );
}
