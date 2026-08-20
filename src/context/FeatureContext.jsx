import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from '../api/axios.js';

const FeatureContext = createContext(null);

export function FeatureProvider({ children }) {
  const [featureSettings, setFeatureSettings] = useState({
    emergencySosEnabled: true,
    publicReportEnabled: true,
    userReportEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/public/features');
      if (data.data?.settings) {
        setFeatureSettings(data.data.settings);
      }
    } catch {
      // Fallback default true
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const updateFeatures = async (newSettings) => {
    const token = localStorage.getItem('beach_app_token');
    const { data } = await axios.put('/api/master/features', newSettings, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data.data?.settings) {
      setFeatureSettings(data.data.settings);
    }
    return data.data?.settings;
  };

  return (
    <FeatureContext.Provider
      value={{
        featureSettings,
        loading,
        fetchFeatures,
        updateFeatures,
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
