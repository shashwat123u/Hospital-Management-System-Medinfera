import api from './api';

export const invoiceService = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  issue: (id) => api.post(`/invoices/${id}/issue`),
  cancel: (id) => api.post(`/invoices/${id}/cancel`),
  recordPayment: (data) => api.post('/invoices/payments', data),
  getPayments: (params = {}) => api.get('/invoices/payments/history', { params }),
  getStatsRevenue: () => api.get('/invoices/stats/revenue'),
};
