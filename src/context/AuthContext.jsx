import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios.js';
import * as authApi from '../api/authApi.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'beach_app_token';
const REFRESH_TOKEN_KEY = 'beach_app_refresh_token';
const TOKEN_TIME_KEY = 'beach_app_token_time';
const LAST_ACTIVE_KEY = 'beach_app_last_active';

// Inactivity limits
const USER_INACTIVITY_LIMIT = 3 * 60 * 60 * 1000;  // 3 hours for regular users
const ADMIN_INACTIVITY_LIMIT = 5 * 60 * 60 * 1000; // 5 hours for Admins

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);
  const lastThrottleRef = useRef(0);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastThrottleRef.current > 10000) {
      lastThrottleRef.current = now;
      try {
        localStorage.setItem(LAST_ACTIVE_KEY, now.toString());
      } catch {}
    }
  }, []);

  const clearToken = useCallback(() => {
    try {
      const savedUser = userRef.current;
      const userId = savedUser?.id || savedUser?._id;
      if (userId) {
        localStorage.removeItem(`location_allowed_${userId}`);
        localStorage.removeItem(`location_allowed_time_${userId}`);
        localStorage.removeItem(`user_location_${userId}`);
        sessionStorage.removeItem(`location_declined_${userId}`);
      }
      localStorage.removeItem('user_last_location');
      localStorage.removeItem('user_location');
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TIME_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  }, []);

  const saveToken = useCallback((token, refreshToken) => {
    const now = Date.now().toString();
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_TIME_KEY, now);
    localStorage.setItem(LAST_ACTIVE_KEY, now);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, []);

  const checkInactivity = useCallback(() => {
    if (!userRef.current) return;
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
    if (!lastActiveStr) return;

    const lastActive = parseInt(lastActiveStr, 10);
    const elapsed = Date.now() - lastActive;

    const isAdmin = userRef.current.role === 'ADMIN' || userRef.current.role === 'MASTER_ADMIN';
    const limit = isAdmin ? ADMIN_INACTIVITY_LIMIT : USER_INACTIVITY_LIMIT;

    if (elapsed >= limit) {
      console.log(`[AuthContext] Inactivity limit reached (${isAdmin ? '5 hours' : '3 hours'}). Logging out silently.`);
      clearToken();
    }
  }, [clearToken]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!token && !storedRefreshToken) {
      clearToken();
      setLoading(false);
      return;
    }

    // Check if inactivity timeout elapsed before restoring session
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
    if (lastActiveStr) {
      const elapsed = Date.now() - parseInt(lastActiveStr, 10);
      // If elapsed exceeds 5 hours (max), clear
      if (elapsed >= ADMIN_INACTIVITY_LIMIT) {
        clearToken();
        setLoading(false);
        return;
      }
    }

    try {
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
      const { data } = await authApi.getMe();
      const userData = data.data.user;
      setUser(userData);
      recordActivity();
    } catch {
      const hasRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!hasRefreshToken) {
        clearToken();
      }
    } finally {
      setLoading(false);
    }
  }, [clearToken, recordActivity]);

  useEffect(() => {
    loadUser();
  }, []);

  // Listen to user interactions to refresh inactivity timer
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      recordActivity();
    };

    window.addEventListener('mousedown', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });

    // Periodic check every 30 seconds + on tab visibility change
    const interval = setInterval(checkInactivity, 30000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, recordActivity, checkInactivity]);

  const login = async (username, password) => {
    const { data } = await authApi.login({ username, password });
    const { token, accessToken, refreshToken, user: userData } = data.data;
    saveToken(accessToken || token, refreshToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const { data } = await authApi.register(formData);
    const { token, accessToken, refreshToken, user: userData } = data.data;
    saveToken(accessToken || token, refreshToken);
    setUser(userData);
    return userData;
  };

  const setSession = (token, userData, refreshToken) => {
    saveToken(token, refreshToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    try {
      const userId = user?.id || user?._id;
      if (userId) {
        api.post('/user/location/stop', { userId }).catch(() => {});
      }
    } catch {
      // ignore
    }
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
