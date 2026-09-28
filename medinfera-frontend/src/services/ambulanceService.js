import api from './api';

export const ambulanceService = {
  getAll: (params) => api.get('/ambulance', { params }),
  getById: (id) => api.get(`/ambulance/${id}`),
  create: (data) => api.post('/ambulance', data),
  update: (id, data) => api.patch(`/ambulance/${id}`, data),
  updateLocation: (id, data) => api.post(`/ambulance/${id}/location`, data),
  getLocationTrail: (id, params) => api.get(`/ambulance/${id}/trail`, { params }),
  dispatch: (data) => api.post('/ambulance/dispatches', data),
  getDispatches: (params) => api.get('/ambulance/dispatches', { params }),
  getDispatchById: (id) => api.get(`/ambulance/dispatches/${id}`),
  updateDispatchStatus: (id, data) => api.patch(`/ambulance/dispatches/${id}/status`, data),
};
