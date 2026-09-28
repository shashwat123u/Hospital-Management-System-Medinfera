import api from './api';

export const prescriptionService = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  dispense: (data) => api.post('/prescriptions/dispense', data),
};
