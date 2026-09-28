import api from './api';

export const medicineService = {
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.patch(`/medicines/${id}`, data),
  getLowStock: () => api.get('/medicines/low-stock'),
  getExpiring: (days) => api.get('/medicines/expiring', { params: { days } }),
};

export const supplierService = {
  getAll: (params) => api.get('/medicines/suppliers', { params }),
  getById: (id) => api.get(`/medicines/suppliers/${id}`),
  create: (data) => api.post('/medicines/suppliers', data),
  update: (id, data) => api.patch(`/medicines/suppliers/${id}`, data),
};

export const purchaseOrderService = {
  getAll: (params) => api.get('/medicines/purchase-orders', { params }),
  getById: (id) => api.get(`/medicines/purchase-orders/${id}`),
  create: (data) => api.post('/medicines/purchase-orders', data),
  receive: (id, data) => api.post(`/medicines/purchase-orders/${id}/receive`, data),
};