import api from './axios.js';

export const createReport = (formData) =>
  api.post('/beach-reports', formData);

export const createReportJson = (data) => api.post('/beach-reports', data);
