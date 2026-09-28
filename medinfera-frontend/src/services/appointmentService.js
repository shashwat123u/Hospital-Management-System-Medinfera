import api from './api';

export const appointmentService = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  reschedule: (id, data) => api.post(`/appointments/${id}/reschedule`, data),
  getSlots: (doctorId, date) => api.get(`/appointments/slots/${doctorId}`, { params: { date } }),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
};