import api from './axios.js';

export const createPass = (formData) => api.post('/resident-pass', formData);

export const getMyPass = () => api.get('/resident-pass/me');
export const getMyQr = () => api.get('/resident-pass/me/qr');
export const updateMyPhoto = (formData) => api.patch('/resident-pass/me/photo', formData);
export const getMyEntries = () => api.get('/resident-pass/me/entries');
