import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const customerService = {
  getProfile: async () => {
    const response = await api.get('/customer/profile');
    return response.data;
  },

  updateProfile: async (formData) => {
    const response = await api.patch('/customer/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getStations: async () => {
    const response = await api.get('/customer/stations');
    return response.data;
  },

  getCoolies: async () => {
    const response = await api.get('/customer/coolies');
    return response.data;
  }
};
