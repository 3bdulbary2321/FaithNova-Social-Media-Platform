import api from './axios';

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
      error: error.response?.data?.message || error.message || 'Cannot reach Laravel API',
      timestamp: new Date().toLocaleTimeString(),
    };
  }
};

export default api;
