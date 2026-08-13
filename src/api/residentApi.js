import api from './axios.js';

export const searchResidents = (name) => api.get('/residents/search', { params: { name } });
export const getResident = (id) => api.get(`/residents/${id}`);
