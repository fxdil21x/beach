import api from './axios.js';

export const createPass = (formData) =>
  api.post('/resident-pass', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getMyPass = () => api.get('/resident-pass/me');
export const getMyQr = () => api.get('/resident-pass/me/qr');
export const getMyEntries = () => api.get('/resident-pass/me/entries');
