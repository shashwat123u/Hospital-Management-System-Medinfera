import api from './api';

export const hospitalService = {
  getAll: (params) => api.get('/hospitals', { params }),
  getById: (id) => api.get(`/hospitals/${id}`),
  create: (data) => api.post('/hospitals', data),
  update: (id, data) => api.patch(`/hospitals/${id}`, data),
  delete: (id) => api.delete(`/hospitals/${id}`),
  getStats: (id) => api.get(`/hospitals/${id}/stats`),
  getUsers: (id, params = {}) => api.get('/users', { params: { ...params, hospitalId: id } }),
};