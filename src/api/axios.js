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

export default api;
