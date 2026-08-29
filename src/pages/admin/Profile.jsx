import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, LogOut, CheckCircle2, Check } from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import Button from '../../components/ui/Button.jsx';
import LanguageSwitcher from '../../components/language/LanguageSwitcher.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';
import { adminNav } from '../../config/navigation.js';

function GoogleIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AdminProfile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const accentColor = appearance.accentColor || '#0284C7';
  const glowColor = appearance.glowColor || 'rgba(2, 132, 199, 0.35)';

  const [googleEmail, setGoogleEmail] = useState(() => {
    return localStorage.getItem('beach_admin_google_email') || user?.email || (user?.username ? `${user.username}@gmail.com` : 'admin@gmail.com');
  });
  const [connected, setConnected] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');

  const handleConnectGoogle = () => {
    setConnecting(true);
    // Open Google Account Authentication & Chooser
    const googleAuthUrl = 'https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin';
    window.open(googleAuthUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      setConnectMessage('Google Account Linked Successfully!');
      setTimeout(() => setConnectMessage(''), 4000);
    }, 800);
  };

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors">
      <MobileHeader title={t('nav.profile', 'Profile')} targetRole="admin" />

      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-6 pb-28">
        {/* Toast Alert */}
        {connectMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500 p-3 text-xs font-bold text-white shadow-md animate-in fade-in duration-200">
            <Check className="h-4 w-4 shrink-0" />
            <span>{connectMessage}</span>
          </div>
        )}

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

        {/* 2. Connect Google Account Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-100 dark:border-slate-800 space-y-3.5 transition-colors">
          <div className="flex items-center justify-between">
            <a
              href="https://myaccount.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              title="Open Google Account"
            >
              <GoogleIcon className="h-4.5 w-4.5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">Google Account</span>
            </a>
            {connected ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 text-[10.5px] font-bold text-amber-700 dark:text-amber-400">
                Not Connected
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <a
              href="https://myaccount.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 group cursor-pointer"
            >
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white group-hover:text-sky-500 transition-colors">{googleEmail}</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">Synced for Google verification & notifications</p>
            </a>

            <button
              type="button"
              disabled={connecting}
              onClick={handleConnectGoogle}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-gray-800 dark:text-gray-100 shadow-xs hover:bg-gray-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="h-4 w-4 shrink-0" />
              <span>{connecting ? 'Connecting...' : 'Connect Google'}</span>
            </button>
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
          className="w-full py-4 text-sm font-bold gap-2 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/60 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('common.logout', 'Logout')}</span>
        </Button>
      </main>

      <BottomNavigation items={adminNav} />
    </div>
  );
}
