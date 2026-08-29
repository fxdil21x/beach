import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Smartphone,
  Shield,
  Palette,
  Eye,
  CheckCircle2,
  Sparkles,
  Layout,
  Home,
  QrCode,
  UtensilsCrossed,
  TriangleAlert,
  Clock,
  User,
  Search,
  LayoutDashboard,
  Footprints,
} from 'lucide-react';

import { getAppearanceSettings, updateAppearanceSettings } from '../../api/masterApi.js';
import { applyGlobalTheme, useFeatureSettings } from '../../context/FeatureContext.jsx';
import ThemeColorCustomizer, { THEME_PRESETS } from './components/ThemeColorCustomizer.jsx';
import IphoneScreenMockup from './components/IphoneScreenMockup.jsx';

const DEFAULT_THEME = {
  themeMode: 'light',
  presetId: 'ocean-blue',
  accentColor: '#0284C7',
  accentSecondary: '#38BDF8',
  bgColor: '#F8FAFC',
  cardBgColor: '#FFFFFF',
  glowColor: 'rgba(2, 132, 199, 0.35)',
  cardRadius: 'rounded-2xl',
  dockStyle: 'floating',
  headerStyle: 'glass',
  glowMode: 'vibrant',
  components: [
    {
      id: 'nav',
      name: 'Bottom Menu Bar',
      type: 'navigation',
      style: 'floating',
      options: ['floating', 'flush'],
      active: true,
    },
    {
      id: 'header',
      name: 'Top Header Bar',
      type: 'header',
      style: 'glass',
      options: ['glass', 'minimal', 'solid'],
      active: true,
    },
    {
      id: 'cards',
      name: 'Card & Surface Containers',
      type: 'surface',
      style: 'rounded-2xl',
      options: ['rounded-xl', 'rounded-2xl', 'rounded-3xl'],
      active: true,
    },
  ],
};

const USER_SCREENS = [
  { id: 'user-home', label: 'User Home', icon: Home },
  { id: 'user-pass', label: 'My Pass (QR)', icon: QrCode },
  { id: 'user-services', label: 'Services & Rides', icon: UtensilsCrossed },
  { id: 'user-report', label: 'Report Issue', icon: TriangleAlert },
  { id: 'user-visits', label: 'My Visits Log', icon: Clock },
  { id: 'user-profile', label: 'Resident Profile', icon: User },
];

const ADMIN_SCREENS = [
  { id: 'admin-search', label: 'Resident Search', icon: Search },
  { id: 'admin-dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
  { id: 'admin-recent', label: 'Live Gate Entries', icon: Footprints },
  { id: 'admin-reports', label: 'Beach Reports', icon: TriangleAlert },
];

export default function Appearance() {
  const { t } = useTranslation();
  const { applyAppearance } = useFeatureSettings();
  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'admin'
  const [activeScreen, setActiveScreen] = useState('user-home');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [themeSettings, setThemeSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('beach_app_theme_settings');
      return saved ? JSON.parse(saved) : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  // Load from backend MongoDB API on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchApiAppearance = async () => {
      setLoading(true);
      try {
        const { data } = await getAppearanceSettings();
        if (data?.data?.appearance && isMounted) {
          const apiAppearance = data.data.appearance;
          setThemeSettings((prev) => ({
            ...prev,
            ...apiAppearance,
          }));
          applyGlobalTheme(apiAppearance);
          applyAppearance?.(apiAppearance);
          localStorage.setItem('beach_app_theme_settings', JSON.stringify(apiAppearance));
        }
      } catch (err) {
        console.warn('Could not load appearance from API, using cached:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchApiAppearance();
    return () => {
      isMounted = false;
    };
  }, []);

  // Automatically update selected screen when switching main tabs
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'user') {
      setActiveScreen('user-home');
    } else {
      setActiveScreen('admin-search');
    }
  };

  const handleThemeChange = (newSettings) => {
    setThemeSettings(newSettings);
    applyGlobalTheme(newSettings);
    applyAppearance?.(newSettings);
    try {
      localStorage.setItem('beach_app_theme_settings', JSON.stringify(newSettings));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('beach:appearance-changed', { detail: newSettings }));
      // Auto-save so subsequent page refreshes immediately retain this color
      updateAppearanceSettings(newSettings).catch(() => {});
    } catch {}
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      // 1. Save to MongoDB Backend API
      await updateAppearanceSettings(themeSettings);

      // 2. Persist to local storage & broadcast event
      applyGlobalTheme(themeSettings);
      applyAppearance?.(themeSettings);
      localStorage.setItem('beach_app_theme_settings', JSON.stringify(themeSettings));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('beach:appearance-changed', { detail: themeSettings }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving theme to API:', e);
      // Fallback local storage save
      applyGlobalTheme(themeSettings);
      applyAppearance?.(themeSettings);
      localStorage.setItem('beach_app_theme_settings', JSON.stringify(themeSettings));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('beach:appearance-changed', { detail: themeSettings }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetTheme = async () => {
    setThemeSettings(DEFAULT_THEME);
    applyGlobalTheme(DEFAULT_THEME);
    try {
      await updateAppearanceSettings(DEFAULT_THEME);
      localStorage.setItem('beach_app_theme_settings', JSON.stringify(DEFAULT_THEME));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error resetting theme on API:', e);
      localStorage.removeItem('beach_app_theme_settings');
      window.dispatchEvent(new Event('storage'));
    }
  };

  const currentScreenList = activeTab === 'user' ? USER_SCREENS : ADMIN_SCREENS;

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-12">
      {/* Studio Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white sm:text-2xl">Appearance & Theme Studio</h1>
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">
              Live Customizer
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Customize colors, typography, components, and preview screens across User & Admin interfaces in real time.
          </p>
        </div>

        {/* Dual Mode Tab Selector */}
        <div className="flex items-center rounded-2xl border border-zinc-800 bg-[#121214] p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => handleTabSwitch('user')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'user'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>User App</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-400 shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Theme settings successfully saved and published globally!</span>
        </div>
      )}

      {/* Screen Gallery Navigation Pills */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-3 shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="shrink-0 text-xs font-semibold text-zinc-500 px-2">
            {activeTab === 'user' ? 'User Screens:' : 'Admin Screens:'}
          </span>
          {currentScreenList.map((screen) => {
            const Icon = screen.icon;
            const isSelected = activeScreen === screen.id;
            return (
              <button
                key={screen.id}
                type="button"
                onClick={() => setActiveScreen(screen.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border border-white/20 text-white shadow-md'
                    : 'border border-transparent bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                }`}
                style={{
                  backgroundColor: isSelected ? themeSettings.accentColor : undefined,
                  boxShadow: isSelected ? `0 0 14px ${themeSettings.glowColor}` : undefined,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{screen.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid: Left Customizer Controls (7 cols) + Right Live iPhone Mockup (5 cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Customizer Settings Panel */}
        <div className="lg:col-span-7 space-y-6">
          <ThemeColorCustomizer
            activeTab={activeTab}
            themeSettings={themeSettings}
            onChangeTheme={handleThemeChange}
            onSave={handleSaveTheme}
            onReset={handleResetTheme}
            isSaving={saving}
            isLoading={loading}
          />
        </div>

        {/* Right iPhone Device Screen Showcase */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white">Live iPhone Device Showcase</h3>
              </div>
              <span className="text-[11px] font-medium text-zinc-400">
                {currentScreenList.find((s) => s.id === activeScreen)?.label || 'Screen'}
              </span>
            </div>

            {/* Live Interactive iPhone Screen Mockup */}
            <IphoneScreenMockup
              activeTab={activeTab}
              activeScreen={activeScreen}
              themeSettings={themeSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
