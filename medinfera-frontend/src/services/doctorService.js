import api from './api';

export const doctorService = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.patch(`/doctors/${id}`, data),
  getSchedule: (id, date) => api.get('/appointments', { params: { doctorId: id, date, limit: 100 } }),
  upsertSchedule: (id, data) => api.post(`/doctors/${id}/schedules`, data),
  deleteSchedule: (id, scheduleId) => api.delete(`/doctors/${id}/schedules/${scheduleId}`),
  addLeave: (id, data) => api.post(`/doctors/${id}/leaves`, data),
  removeLeave: (id, leaveId) => api.delete(`/doctors/${id}/leaves/${leaveId}`),
  getSlots: (doctorId, date) => api.get(`/appointments/slots/${doctorId}`, { params: { date } }),
  getDashboard: (id) => api.get(`/doctors/${id}/dashboard`),
};