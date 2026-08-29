import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from '../api/axios.js';

const FeatureContext = createContext(null);

const DEFAULT_APPEARANCE = {
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
};

export function applyGlobalTheme(appearance) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const current = appearance || DEFAULT_APPEARANCE;

  const accent = current.accentColor || '#0284C7';
  const accentSec = current.accentSecondary || '#38BDF8';
  const glow = current.glowColor || 'rgba(2, 132, 199, 0.35)';
  const radius =
    current.cardRadius === 'rounded-3xl'
      ? '24px'
      : current.cardRadius === 'rounded-xl'
      ? '12px'
      : '16px';
  const btnRadius =
    current.cardRadius === 'rounded-3xl'
      ? '16px'
      : current.cardRadius === 'rounded-xl'
      ? '8px'
      : '12px';

  root.style.setProperty('--theme-accent', accent);
  root.style.setProperty('--theme-accent-sec', accentSec);
  root.style.setProperty('--theme-glow', glow);
  root.style.setProperty('--theme-card-radius', radius);
  root.style.setProperty('--theme-btn-radius', btnRadius);

  const isDark = current.themeMode === 'dark';
  const bg = isDark ? (current.bgColor || '#090A0F') : (current.bgColor || '#F8FAFC');
  const cardBg = isDark ? (current.cardBgColor || '#121214') : (current.cardBgColor || '#FFFFFF');

  root.style.setProperty('--theme-bg', bg);
  root.style.setProperty('--theme-card-bg', cardBg);
  root.style.setProperty('--theme-dock-style', current.dockStyle || 'floating');
  root.style.setProperty('--theme-header-style', current.headerStyle || 'glass');

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

export function FeatureProvider({ children }) {
  const [featureSettings, setFeatureSettings] = useState(() => {
    let cachedAppearance = DEFAULT_APPEARANCE;
    try {
      const saved = localStorage.getItem('beach_app_theme_settings');
      if (saved) cachedAppearance = JSON.parse(saved);
    } catch {}

    // Apply initial cached theme immediately
    applyGlobalTheme(cachedAppearance);

    return {
      emergencySosEnabled: true,
      publicReportEnabled: true,
      userReportEnabled: true,
      trackUserEnabled: false,
      orderFoodEnabled: true,
      resortBookingEnabled: true,
      tabMaintenance: [],
      appearance: cachedAppearance,
    };
  });
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    try {
      const { data } = await axios.get('/public/features');
      if (data.data?.settings) {
        const serverSettings = data.data.settings;
        let activeAppearance = DEFAULT_APPEARANCE;
        const saved = localStorage.getItem('beach_app_theme_settings');
        if (saved) {
          try {
            activeAppearance = JSON.parse(saved);
          } catch {}
        }
        if (serverSettings.appearance && serverSettings.appearance.accentColor) {
          activeAppearance = serverSettings.appearance;
          localStorage.setItem('beach_app_theme_settings', JSON.stringify(serverSettings.appearance));
        }

        applyGlobalTheme(activeAppearance);
        setFeatureSettings((prev) => ({
          ...prev,
          ...serverSettings,
          appearance: activeAppearance,
        }));
      }
    } catch {
      // Fallback to cached theme
      try {
        const saved = localStorage.getItem('beach_app_theme_settings');
        if (saved) applyGlobalTheme(JSON.parse(saved));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Listen for real-time socket feature & appearance updates and storage events
  useEffect(() => {
    let socketInstance = null;

    const handleFeaturesUpdated = (payload) => {
      if (payload?.settings) {
        setFeatureSettings((prev) => ({
          ...prev,
          ...payload.settings,
        }));
        if (payload.settings.appearance) {
          applyGlobalTheme(payload.settings.appearance);
          localStorage.setItem('beach_app_theme_settings', JSON.stringify(payload.settings.appearance));
        }
      }
    };

    const handleAppearanceUpdated = (payload) => {
      if (payload?.appearance) {
        setFeatureSettings((prev) => ({
          ...prev,
          appearance: payload.appearance,
        }));
        applyGlobalTheme(payload.appearance);
        localStorage.setItem('beach_app_theme_settings', JSON.stringify(payload.appearance));
      }
    };

    const handleDirectThemeChange = (e) => {
      const customAppearance = e?.detail;
      if (customAppearance) {
        setFeatureSettings((prev) => ({
          ...prev,
          appearance: customAppearance,
        }));
        applyGlobalTheme(customAppearance);
        try {
          localStorage.setItem('beach_app_theme_settings', JSON.stringify(customAppearance));
        } catch {}
      }
    };

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('beach_app_theme_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFeatureSettings((prev) => ({
            ...prev,
            appearance: parsed,
          }));
          applyGlobalTheme(parsed);
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beach:appearance-changed', handleDirectThemeChange);

    const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'https://beach-verification-backend.onrender.com';

    try {
      socketInstance = io(SOCKET_SERVER_URL, {
        path: '/api/socket.io',
        withCredentials: true,
        transports: ['websocket'],
      });
      socketInstance.on('features:updated', handleFeaturesUpdated);
      socketInstance.on('appearance:updated', handleAppearanceUpdated);
    } catch (e) {
      console.error('FeatureContext socket error:', e);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beach:appearance-changed', handleDirectThemeChange);
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const updateFeatures = async (newSettings) => {
    const { data } = await axios.put('/master/features', newSettings);
    if (data.data?.settings) {
      setFeatureSettings(data.data.settings);
      if (data.data.settings.appearance) {
        applyGlobalTheme(data.data.settings.appearance);
      }
    }
    return data.data?.settings;
  };

  const applyAppearance = useCallback((newAppearance) => {
    applyGlobalTheme(newAppearance);
    setFeatureSettings((prev) => ({
      ...prev,
      appearance: newAppearance,
    }));
    try {
      localStorage.setItem('beach_app_theme_settings', JSON.stringify(newAppearance));
    } catch {}
  }, []);

  const getTabMaintenance = useCallback(
    (tabId) => {
      const tabs = featureSettings.tabMaintenance || [];
      return tabs.find((t) => t.tabId === tabId) || { isBlocked: false };
    },
    [featureSettings.tabMaintenance]
  );

  return (
    <FeatureContext.Provider
      value={{
        featureSettings,
        appearance: featureSettings.appearance || DEFAULT_APPEARANCE,
        loading,
        fetchFeatures,
        updateFeatures,
        applyAppearance,
        getTabMaintenance,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatureSettings() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatureSettings must be used within a FeatureProvider');
  }
  return context;
}
