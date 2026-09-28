import api from './api';

export const labService = {
  // Orders
  getOrders: (params) => api.get('/lab/orders', { params }),
  getOrderById: (id) => api.get(`/lab/orders/${id}`),
  createOrder: (data) => api.post('/lab/orders', data),
  updateOrderStatus: (id, status) => api.patch(`/lab/orders/${id}/status`, { status }),
  enterResults: (id, data) => api.post(`/lab/orders/${id}/results`, data),
  getTests: (params) => api.get('/lab/tests', { params }),
  createTest: (data) => api.post('/lab/tests', data),
  updateTest: (id, data) => api.patch(`/lab/tests/${id}`, data),
};
