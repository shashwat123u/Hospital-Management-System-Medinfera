import api from './api';

export const ipdService = {
  getAll: (params) => api.get('/ipd', { params }),
  getById: (id) => api.get(`/ipd/${id}`),
  create: (data) => api.post('/ipd', data),
  updateStatus: (id, status) => api.patch(`/ipd/${id}/status`, { status }),
  addNote: (id, data) => api.post(`/ipd/${id}/notes`, data),
  discharge: (id, data) => api.post(`/ipd/${id}/discharge`, data),
  transferBed: (id, toBedId, reason = '') => api.post(`/ipd/${id}/transfer-bed`, { toBedId, reason }),
  addAttendingDoctor: (id, doctorId) => api.post(`/ipd/${id}/doctors`, { doctorId }),
};