import api from './api';

export const payoutService = {
  getPayroll: (params) => api.get('/payouts/payroll', { params }),
  getPayrollById: (id) => api.get(`/payouts/payroll/${id}`),
  createPayroll: (data) => api.post('/payouts/payroll', data),
  processPayroll: (id) => api.patch(`/payouts/payroll/${id}/process`),
  getPayouts: (params) => api.get('/payouts/payouts', { params }),
  getPayoutById: (id) => api.get(`/payouts/payouts/${id}`),
  createPayout: (data) => api.post('/payouts/payouts', data),
  markPayoutPaid: (id, data) => api.patch(`/payouts/payouts/${id}/mark-paid`, data),
};
