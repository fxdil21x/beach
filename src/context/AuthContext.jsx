import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import * as authApi from '../api/authApi.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'beach_app_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      const { data } = await authApi.getMe();
      setUser(data.data.user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common.Authorization;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    const { data } = await authApi.login({ username, password });
    const { token, user: userData } = data.data;
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const { data } = await authApi.register(formData);
    const { token, user: userData } = data.data;
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const setSession = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
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
