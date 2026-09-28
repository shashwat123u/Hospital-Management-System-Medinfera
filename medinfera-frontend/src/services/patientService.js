import api from './api';

export const patientService = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.patch(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  addVitals: (id, data) => api.post(`/patients/${id}/vitals`, data),
  getVitals: (id) => api.get(`/patients/${id}/vitals`),
  getMedicalHistory: (id) => api.get(`/patients/${id}/medical-history`),
  search: (query, params = {}) => api.get('/patients', { params: { ...params, search: query } }),
};