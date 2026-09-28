import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');

// In-memory token store (NOT localStorage for accessToken)
let accessToken = null;
let refreshToken = null;
let isRefreshing = false;
let failedQueue = [];
export const ACCESS_TOKEN_UPDATED_EVENT = 'medinfera:access-token-updated';

export const setAccessToken = (token) => {
  accessToken = token;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ACCESS_TOKEN_UPDATED_EVENT));
  }
};

export const getAccessToken = () => accessToken;

export const setRefreshToken = (token) => {
  refreshToken = token;
  localStorage.setItem('refreshToken', token);
};

export const getRefreshToken = () => {
  if (!refreshToken) {
    refreshToken = localStorage.getItem('refreshToken');
  }
  return refreshToken;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('refreshToken');
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach accessToken to every request
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = getRefreshToken();
      
      if (!currentRefreshToken) {
        isRefreshing = false;
        failedQueue.forEach(({ reject }) => reject(error));
        failedQueue = [];
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: currentRefreshToken
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data?.data || response.data;
        if (!newAccessToken || !newRefreshToken) {
          throw new Error('The refresh response did not contain a token pair');
        }
        
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        // Retry all queued requests
        failedQueue.forEach(({ resolve }) => resolve(newAccessToken));
        failedQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach(({ reject }) => reject(refreshError));
        failedQueue = [];
        
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;