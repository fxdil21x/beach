import api from './axios.js';

export const createReport = (formData) =>
  api.post('/beach-reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const createReportJson = (data) => api.post('/beach-reports', data);
