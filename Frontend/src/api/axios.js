import axios from 'axios';

// Default to Laravel server running on port 8000 or the Vite proxy /api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: automatically attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('faithnova_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle unauthorized responses or network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      const currentToken = localStorage.getItem('faithnova_token');
      if (currentToken) {
        localStorage.removeItem('faithnova_token');
        localStorage.removeItem('faithnova_user');
        window.dispatchEvent(new Event('faithnova_auth_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
