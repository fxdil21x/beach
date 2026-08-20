import api from './axios.js';

export const getMasterAnnouncements = () => api.get('/master/announcements');
export const createAnnouncement = (data) => api.post('/master/announcements', data);
export const updateAnnouncement = (id, data) => api.patch(`/master/announcements/${id}`, data);
export const deleteAnnouncement = (id) => api.delete(`/master/announcements/${id}`);

export const getPublicAnnouncements = (role = 'user') =>
  api.get('/public/announcements', { params: { role } });
