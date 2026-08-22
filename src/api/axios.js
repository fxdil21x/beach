import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (!/^https?:\/\//i.test(rawUrl)) {
  rawUrl = (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1'))
    ? `http://${rawUrl}`
    : `https://${rawUrl}`;
}
// Automatically ensure /api prefix is present
const baseURL = rawUrl.replace(/\/+$/, '').endsWith('/api')
  ? rawUrl.replace(/\/+$/, '')
  : `${rawUrl.replace(/\/+$/, '')}/api`;

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
