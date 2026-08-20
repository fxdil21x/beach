import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import * as authApi from '../api/authApi.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'beach_app_token';
const TOKEN_TIME_KEY = 'beach_app_token_time';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TIME_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  }, []);

  const saveToken = useCallback((token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_TIME_KEY, Date.now().toString());
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, []);

  const getRemainingTime = useCallback(() => {
    const savedTime = localStorage.getItem(TOKEN_TIME_KEY);
    if (!savedTime) return 0;
    const elapsed = Date.now() - parseInt(savedTime, 10);
    return Math.max(0, SESSION_DURATION - elapsed);
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const remaining = getRemainingTime();

    if (!token || remaining <= 0) {
      clearToken();
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      const { data } = await authApi.getMe();
      setUser(data.data.user);
    } catch {
      clearToken();
    } finally {
      setLoading(false);
    }
  }, [clearToken, getRemainingTime]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Auto logout timer when 30 minutes lapse while active
  useEffect(() => {
    if (!user) return;
    const remaining = getRemainingTime();
    if (remaining <= 0) {
      clearToken();
      return;
    }

    const timer = setTimeout(() => {
      clearToken();
    }, remaining);

    return () => clearTimeout(timer);
  }, [user, getRemainingTime, clearToken]);

  // Check expiration on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        if (getRemainingTime() <= 0) {
          clearToken();
        }
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, getRemainingTime, clearToken]);

  const login = async (username, password) => {
    const { data } = await authApi.login({ username, password });
    const { token, user: userData } = data.data;
    saveToken(token);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const { data } = await authApi.register(formData);
    const { token, user: userData } = data.data;
    saveToken(token);
    setUser(userData);
    return userData;
  };

  const setSession = (token, userData) => {
    saveToken(token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setSession, reloadUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
