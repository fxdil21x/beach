import api from './axios.js';

export const scanResident = (qrToken) => api.post('/admin/scan-resident', { qrToken });
export const searchResidents = (params) => api.get('/admin/residents', { params });
export const getResident = (id) => api.get(`/admin/residents/${id}`);
export const getEntryLogs = (params) => api.get('/admin/entry-logs', { params });
export const getVisitorEntries = (params) => api.get('/admin/visitor-entries', { params });
export const getPendingVisitorEntries = () => api.get('/admin/visitor-entries/pending');
export const reviewVisitorEntry = (id, status) => api.patch(`/admin/visitor-entries/${id}/review`, { status });
export const getPendingVisitorEventsUrl = (token) =>
  `${api.defaults.baseURL}/admin/visitor-entries/events?token=${encodeURIComponent(token)}`;
export const getReports = (params) => api.get('/admin/beach-reports', { params });
export const updateReportStatus = (id, status) => api.patch(`/admin/beach-reports/${id}`, { status });
