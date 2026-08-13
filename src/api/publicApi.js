import api from './axios.js';

export const searchResidents = (name) =>
  api.get('/public/residents/search', { params: { name } });

export const registerResidentPass = (formData) =>
  api.post('/public/resident-register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const loginResident = (data) => api.post('/public/resident-login', data);
