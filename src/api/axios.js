import axios from 'axios';

export const getCleanApiUrl = () => {
  let raw = import.meta.env.VITE_API_URL || 'https://beach-verification-backend.onrender.com/api';

  // Strip accidental environment variable name prefixes or key-value assignments (e.g., PUBLIC_API_URL=https://...)
  if (typeof raw === 'string' && raw.includes('=')) {
    raw = raw.split('=').pop().trim();
  }
  if (typeof raw === 'string') {
    raw = raw.replace(/^['"]+|['"]+$/g, '').trim();
  }
  if (!/^https?:\/\//i.test(raw)) {
    raw = raw.includes('localhost') || raw.includes('127.0.0.1')
      ? `http://${raw}`
      : `https://${raw}`;
  }
  return raw;
};

export const getBaseApiUrl = () => {
  const clean = getCleanApiUrl();
  return clean.replace(/\/+$/, '').endsWith('/api')
    ? clean.replace(/\/+$/, '')
    : `${clean.replace(/\/+$/, '')}/api`;
};

export const getSocketServerUrl = () => {
  const base = getBaseApiUrl();
  return base.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
};

const baseURL = getBaseApiUrl();

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('beach_app_token');
  const tokenTime = localStorage.getItem('beach_app_token_time');

  if (token && tokenTime) {
    if (Date.now() - parseInt(tokenTime, 10) >= SESSION_DURATION_MS) {
      // 2 hours elapsed, check if refresh token exists
      const refreshToken = localStorage.getItem('beach_app_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('beach_app_token');
        localStorage.removeItem('beach_app_token_time');
        delete config.headers.Authorization;
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers?.setContentType) {
      config.headers.setContentType(false);
    } else if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
  return config;
});

// Refresh token handling queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Skip refresh token logic on authentication requests themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const storedRefreshToken = localStorage.getItem('beach_app_refresh_token');

      if (!storedRefreshToken) {
        localStorage.removeItem('beach_app_token');
        localStorage.removeItem('beach_app_token_time');
        delete api.defaults.headers.common.Authorization;
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken: storedRefreshToken,
        });

        const newAccessToken = response.data?.data?.accessToken || response.data?.data?.token;
        const newRefreshToken = response.data?.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('beach_app_token', newAccessToken);
          localStorage.setItem('beach_app_token_time', Date.now().toString());

          if (newRefreshToken) {
            localStorage.setItem('beach_app_refresh_token', newRefreshToken);
          }

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('beach_app_token');
        localStorage.removeItem('beach_app_refresh_token');
        localStorage.removeItem('beach_app_token_time');
        delete api.defaults.headers.common.Authorization;
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
