import api from './api';

export const bedService = {
  getAll: (params) => api.get('/beds', { params }),
  getById: (id) => api.get(`/beds/${id}`),
  create: (data) => api.post('/beds', data),
  getWards: () => api.get('/beds/wards'),
  getWardById: (wardId) => api.get(`/beds/wards/${wardId}`),
  createWard: (data) => api.post('/beds/wards', data),
  updateWard: (wardId, data) => api.patch(`/beds/wards/${wardId}`, data),
  updateStatus: (id, status) => api.patch(`/beds/${id}/status`, { status }),
  getStats: () => api.get('/beds/stats'),
};