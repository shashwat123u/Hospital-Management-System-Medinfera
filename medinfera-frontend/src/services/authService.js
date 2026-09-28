import api from './api';
import { getRefreshToken } from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout', { refreshToken: getRefreshToken() }),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};