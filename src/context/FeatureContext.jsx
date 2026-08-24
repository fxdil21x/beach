import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from '../api/axios.js';

const FeatureContext = createContext(null);

export function FeatureProvider({ children }) {
  const [featureSettings, setFeatureSettings] = useState({
    emergencySosEnabled: true,
    publicReportEnabled: true,
    userReportEnabled: true,
    trackUserEnabled: false,
    orderFoodEnabled: true,
    resortBookingEnabled: true,
    tabMaintenance: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    try {
      const { data } = await axios.get('/public/features');
      if (data.data?.settings) {
        setFeatureSettings((prev) => ({
          ...prev,
          ...data.data.settings,
        }));
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Listen for real-time socket feature settings updates
  useEffect(() => {
    let socketInstance = null;

    const handleFeaturesUpdated = (payload) => {
      if (payload?.settings) {
        setFeatureSettings((prev) => ({
          ...prev,
          ...payload.settings,
        }));
      }
    };

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
    } catch (e) {
      console.error('FeatureContext socket error:', e);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const updateFeatures = async (newSettings) => {
    const { data } = await axios.put('/master/features', newSettings);
    if (data.data?.settings) {
      setFeatureSettings(data.data.settings);
    }
    return data.data?.settings;
  };

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
        loading,
        fetchFeatures,
        updateFeatures,
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
