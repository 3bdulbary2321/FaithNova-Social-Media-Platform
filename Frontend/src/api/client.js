import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 5000,
});

export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/status');
    return {
      connected: true,
      data: response.data,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message || 'Cannot reach Laravel API',
      timestamp: new Date().toLocaleTimeString(),
    };
  }
};

export default api;
