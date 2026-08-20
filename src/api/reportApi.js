import api from './axios.js';

export const createReport = (formData) =>
  api.post('/beach-reports', formData);

export const createReportJson = (data) => api.post('/beach-reports', data);

export const getMyReports = () => api.get('/beach-reports/me');

export const getUserReportEventsUrl = (token) =>
  `${api.defaults.baseURL}/beach-reports/events/user?token=${encodeURIComponent(token)}`;

