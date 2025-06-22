import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: async (userData: { name: string; username: string; email: string; password: string; bio?: string }) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },

  login: async (credentials: { emailOrUsername: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (updates: { name?: string; username?: string; bio?: string; avatar_url?: string }) => {
    const response = await api.put('/api/auth/profile', updates);
    return response.data;
  },
};

// User API calls
export const userAPI = {
  searchUsers: async (query: string) => {
    const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },
};

// Friends API calls
export const friendsAPI = {
  getFriends: async () => {
    const response = await api.get('/api/friends');
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/api/friends/requests');
    return response.data;
  },

  sendFriendRequest: async (friendId: string) => {
    const response = await api.post('/api/friends/request', { friendId });
    return response.data;
  },

  respondToFriendRequest: async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const response = await api.put(`/api/friends/requests/${requestId}`, { status });
    return response.data;
  },

  removeFriend: async (friendshipId: string) => {
    const response = await api.delete(`/api/friends/${friendshipId}`);
    return response.data;
  },
};

export default api;