import axios from './axios.js';

export async function getServices(params = {}) {
  const response = await axios.get('/services', { params });
  return response.data;
}

export async function getServiceById(id) {
  const response = await axios.get(`/services/${id}`);
  return response.data;
}

export async function createService(serviceData) {
  const response = await axios.post('/services', serviceData);
  return response.data;
}

export async function updateService(id, serviceData) {
  const response = await axios.put(`/services/${id}`, serviceData);
  return response.data;
}

export async function deleteService(id) {
  const response = await axios.delete(`/services/${id}`);
  return response.data;
}

// ── Restaurant Food Items API ───────────────────────────────────────────────
export async function addMenuItem(serviceId, itemData) {
  const response = await axios.post(`/services/${serviceId}/menu`, itemData);
  return response.data;
}

export async function updateMenuItem(serviceId, itemId, itemData) {
  const response = await axios.put(`/services/${serviceId}/menu/${itemId}`, itemData);
  return response.data;
}

export async function toggleMenuItemAvailability(serviceId, itemId) {
  const response = await axios.patch(`/services/${serviceId}/menu/${itemId}/toggle`);
  return response.data;
}

export async function deleteMenuItem(serviceId, itemId) {
  const response = await axios.delete(`/services/${serviceId}/menu/${itemId}`);
  return response.data;
}
