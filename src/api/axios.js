import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = /^https?:\/\//i.test(configuredBaseUrl)
  ? configuredBaseUrl
  : `https://${configuredBaseUrl}`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('beach_app_token');
  const tokenTime = localStorage.getItem('beach_app_token_time');
  if (token && tokenTime) {
    if (Date.now() - parseInt(tokenTime, 10) >= 30 * 60 * 1000) {
      localStorage.removeItem('beach_app_token');
      localStorage.removeItem('beach_app_token_time');
      delete config.headers.Authorization;
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


export default api;
