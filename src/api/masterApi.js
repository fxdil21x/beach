import api from './axios.js';

export const getDashboard = () => api.get('/master/dashboard');
export const getAnalytics = () => api.get('/master/analytics');
export const importResidents = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/master/import-residents', formData);
};
export const getResidentRecords = (params) => api.get('/master/resident-records', { params });
export const createResidentRecord = (data) => api.post('/master/resident-records', data);
export const updateResidentRecord = (id, data) => api.patch(`/master/resident-records/${id}`, data);
export const deleteResidentRecord = (id) => api.delete(`/master/resident-records/${id}`);
export const getRegisteredResidents = (params) => api.get('/master/registered-residents', { params });
export const getVisitorEntries = (params) => api.get('/master/visitor-entries', { params });
export const getEntryLogs = (params) => api.get('/master/entry-logs', { params });
export const getUsers = (params) => api.get('/master/users', { params });
export const createUser = (data) => api.post('/master/users', data);
export const updateUser = (id, data) => api.patch(`/master/users/${id}`, data);
export const getAdmins = () => api.get('/master/admins');
export const getAuditLogs = (params) => api.get('/master/audit-logs', { params });
export const getReports = (params) => api.get('/master/beach-reports', { params });
export const togglePassStatus = (id, isActive) => api.patch(`/master/passes/${id}`, { isActive });
