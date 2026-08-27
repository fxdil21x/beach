import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios.js';
import * as authApi from '../api/authApi.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'beach_app_token';
const REFRESH_TOKEN_KEY = 'beach_app_refresh_token';
const TOKEN_TIME_KEY = 'beach_app_token_time';
const SESSION_DURATION = 15 * 60 * 60 * 1000; // 15 hours in milliseconds

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

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
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  }, []);

  const saveToken = useCallback((token, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_TIME_KEY, Date.now().toString());
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
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
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!token && !storedRefreshToken) {
      clearToken();
      setLoading(false);
      return;
    }

    try {
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
      const { data } = await authApi.getMe();
      setUser(data.data.user);
    } catch {
      // If token expired but refresh token exists, axios interceptor will handle it
      const hasRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!hasRefreshToken) {
        clearToken();
      }
    } finally {
      setLoading(false);
    }
  }, [clearToken, getRemainingTime]);

  useEffect(() => {
    loadUser();
  }, []); // Run only once on mount

  // Auto token expiry timer when 2 hours lapse without activity/refresh
  useEffect(() => {
    if (!user) return;
    const remaining = getRemainingTime();
    if (remaining <= 0) {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        clearToken();
      }
      return;
    }

    const timer = setTimeout(() => {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        clearToken();
      }
    }, remaining);

    return () => clearTimeout(timer);
  }, [user, getRemainingTime, clearToken]);

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
