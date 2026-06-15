import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Stocks
export const stocksAPI = {
  getAll: (params) => api.get('/stocks', { params }),
  getById: (id) => api.get(`/stocks/${id}`),
  getSectors: () => api.get('/stocks/sectors'),
  create: (data) => api.post('/stocks', data),
  update: (id, data) => api.put(`/stocks/${id}`, data),
  delete: (id) => api.delete(`/stocks/${id}`),
};

// Portfolio
export const portfolioAPI = {
  get: (userId) => api.get(`/portfolio/${userId}`),
};

// Transactions
export const transactionsAPI = {
  buy: (data) => api.post('/transactions/buy', data),
  sell: (data) => api.post('/transactions/sell', data),
  getByUser: (userId) => api.get(`/transactions/${userId}`),
  getAll: () => api.get('/transactions/all'),
};

// Watchlist
export const watchlistAPI = {
  get: (userId) => api.get(`/watchlist/${userId}`),
  add: (data) => api.post('/watchlist', data),
  remove: (id) => api.delete(`/watchlist/${id}`),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
