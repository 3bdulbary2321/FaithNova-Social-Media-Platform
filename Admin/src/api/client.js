import axios from 'axios';

export const TOKEN_KEY = 'faithnova_admin_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('admin:signed-out'));
    }
    return Promise.reject(error);
  },
);

/** Pull a readable message out of a Laravel error response. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0];
  return firstFieldError || data?.message || fallback;
}

export const moderation = {
  overview: (days = 14) => api.get('/moderation/overview', { params: { days } }).then(r => r.data.data),
  reports: params => api.get('/moderation/reports', { params }).then(r => r.data.data),
  resolveReport: (id, body) => api.post(`/moderation/reports/${id}/resolve`, body).then(r => r.data),
  deletePost: (id, body) => api.delete(`/moderation/posts/${id}`, { data: body }).then(r => r.data),
  users: params => api.get('/moderation/users', { params }).then(r => r.data.data),
  blockUser: (id, reason) => api.post(`/moderation/users/${id}/block`, { reason }).then(r => r.data),
  unblockUser: id => api.post(`/moderation/users/${id}/unblock`).then(r => r.data),
  notifications: params => api.get('/moderation/notifications', { params }).then(r => r.data),
  markRead: ids => api.post('/moderation/notifications/read', ids ? { ids } : {}).then(r => r.data),
  sendNotification: body => api.post('/moderation/notifications/send', body).then(r => r.data),
};

export default api;
