import api from './axios.js';

export const getInstructions = () => api.get('/beach/instructions');
export const submitEntry = (data) => api.post('/visitor-entry', data);
export const getEntryStatus = (id) => api.get(`/visitor-entry/${id}/status`);
export const getEntryEventsUrl = (id) => `${api.defaults.baseURL}/visitor-entry/${id}/events`;
