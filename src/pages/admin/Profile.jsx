import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, LogOut, CheckCircle2, Check, X, Plus, UserCheck } from 'lucide-react';
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
    return localStorage.getItem('beach_admin_google_email') || user?.email || '';
  });
  const [connected, setConnected] = useState(() => {
    return Boolean(localStorage.getItem('beach_admin_google_email') || user?.email);
  });
  const [connectMessage, setConnectMessage] = useState('');
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Available / Detected Google Accounts on Device
  const availableAccounts = [
    {
      name: user?.name || 'Gate Admin',
      email: user?.email || (user?.username ? `${user.username}@beachverification.com` : 'admin@beachverification.com'),
      avatarBg: 'bg-blue-600',
    },
    {
      name: 'Muzhappilangad Gate Control',
      email: 'muzhappilangad.gate@gmail.com',
      avatarBg: 'bg-emerald-600',
    },
    {
      name: 'Beach Safety & Management',
      email: 'beachops.kannur@gmail.com',
      avatarBg: 'bg-purple-600',
    },
  ];

  const handleSelectAccount = (account) => {
    setGoogleEmail(account.email);
    setConnected(true);
    try {
      localStorage.setItem('beach_admin_google_email', account.email);
    } catch {}
    setShowAccountChooser(false);
    setShowCustomInput(false);
    setConnectMessage(`Connected as ${account.email}`);
    setTimeout(() => setConnectMessage(''), 4000);
  };

  const handleAddCustomAccount = (e) => {
    e.preventDefault();
    if (!customEmailInput.trim()) return;
    const finalEmail = customEmailInput.includes('@') ? customEmailInput.trim() : `${customEmailInput.trim()}@gmail.com`;
    handleSelectAccount({ name: 'Google Account', email: finalEmail });
    setCustomEmailInput('');
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
            <div className="flex items-center gap-2">
              <GoogleIcon className="h-4.5 w-4.5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">Google Account</span>
            </div>
            {connected && googleEmail ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                Not Linked
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {connected && googleEmail ? googleEmail : 'No Google account linked'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                {connected && googleEmail
                  ? 'Synced for Google verification & gate security'
                  : 'Link your Gmail to enable one-tap Google sign-in'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAccountChooser(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-gray-800 dark:text-gray-100 shadow-xs hover:bg-gray-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all cursor-pointer"
            >
              <GoogleIcon className="h-4 w-4 shrink-0" />
              <span>{connected && googleEmail ? 'Switch Account' : 'Connect Google'}</span>
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
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-bold text-rose-500 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-500/20 dark:hover:bg-rose-900/40 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('common.logout', 'Logout')}</span>
        </button>
      </main>

      {/* ────────────────────────────────────────────────────────────────────────
          GOOGLE ACCOUNT CHOOSER MODAL (Multiple Accounts Selector)
      ──────────────────────────────────────────────────────────────────────── */}
      {showAccountChooser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowAccountChooser(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Google Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="h-6 w-6" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Choose an account</h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">to continue to Beach Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountChooser(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List of Accounts */}
            <div className="space-y-2 pt-1">
              {availableAccounts.map((acc, index) => {
                const isSelected = googleEmail === acc.email;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-sky-500/50 bg-sky-50/50 dark:bg-sky-950/30'
                        : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${acc.avatarBg}`}>
                        {acc.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{acc.name}</p>
                        <p className="truncate text-[11px] text-gray-500 dark:text-slate-400">{acc.email}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}

              {/* Use Another Account Option */}
              {showCustomInput ? (
                <form onSubmit={handleAddCustomAccount} className="pt-2 space-y-2">
                  <input
                    type="email"
                    required
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    placeholder="Enter Gmail (e.g. name@gmail.com)"
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl py-2 text-xs font-bold text-white shadow-sm transition-colors"
                      style={{ backgroundColor: accentColor }}
                    >
                      Connect This Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Use another account</p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">Sign in with a different Gmail</p>
                  </div>
                </button>
              )}
            </div>

            {/* Privacy note */}
            <p className="text-[10px] text-center text-gray-400 dark:text-slate-500 pt-2 border-t border-gray-100 dark:border-slate-800">
              To continue, Google will share your name, email address, and profile picture with Beach Admin.
            </p>
          </div>
        </div>
      )}

      <BottomNavigation items={adminNav} />
    </div>
  );
}
