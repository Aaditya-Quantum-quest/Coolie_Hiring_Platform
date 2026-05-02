import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Coolie Profile Service
export const coolieProfileService = {
  // Get coolie profile data (Rankings subset)
  getProfile: async (coolieId) => {
    try {
      const response = await api.get(`/rankings/profile/${coolieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coolie profile:', error);
      throw error;
    }
  },

  // Get full coolie profile data (Documents, sensitive info)
  getFullProfile: async () => {
    try {
      const response = await api.get('/coolies/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching full coolie profile:', error);
      throw error;
    }
  },

  // Update coolie profile
  updateProfile: async (coolieId, profileData) => {
    try {
      const response = await api.put(`/coolies/profile/${coolieId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating coolie profile:', error);
      throw error;
    }
  },
};

// Coolie Earnings Service
export const coolieEarningsService = {
  // Get earnings data
  getEarnings: async (coolieId, period = 'weekly') => {
    try {
      const response = await api.get(`/coolies/earnings/${coolieId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }
  },

  // Get transaction history
  getTransactions: async (coolieId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/coolies/transactions/${coolieId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get weekly earnings summary
  getWeeklySummary: async (coolieId) => {
    try {
      const response = await api.get(`/coolies/earnings/${coolieId}/weekly-summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      throw error;
    }
  },
};

// Coolie Leaderboard Service
export const coolieLeaderboardService = {
  // Get weekly leaderboard
  getWeeklyLeaderboard: async () => {
    try {
      const response = await api.get('/rankings/leaderboard/weekly');
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  // Get all-time leaderboard
  getAllTimeLeaderboard: async () => {
    try {
      const response = await api.get('/rankings/leaderboard/all-time');
      return response.data;
    } catch (error) {
      console.error('Error fetching all-time leaderboard:', error);
      throw error;
    }
  },

  // Get monthly leaderboard
  getMonthlyLeaderboard: async () => {
    try {
      const response = await api.get('/rankings/leaderboard/monthly');
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly leaderboard:', error);
      throw error;
    }
  },
};

// Coolie Dashboard Service
export const coolieDashboardService = {
  // Get dashboard stats
  getStats: async (coolieId) => {
    try {
      const response = await api.get(`/coolies/dashboard/${coolieId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get active jobs
  getActiveJobs: async (coolieId) => {
    try {
      const response = await api.get(`/coolies/active-jobs/${coolieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      throw error;
    }
  },

  // Get completed jobs today
  getCompletedToday: async (coolieId) => {
    try {
      const response = await api.get(`/coolies/completed-today/${coolieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
      throw error;
    }
  },

  // Get upcoming requests
  getUpcomingRequests: async (coolieId) => {
    try {
      const response = await api.get(`/coolies/requests/${coolieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  },

  // Get consolidated overview (Prevent 429)
  getOverview: async (coolieId) => {
    try {
      const response = await api.get(`/coolies/dashboard-overview/${coolieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  },

  // Update booking status
  updateStatus: async (bookingRef, status) => {
    try {
      // Note: This endpoint is actually in bookingRoutes, but we map it here for convenience
      // bookingRoutes is app.use('/api/bookings', bookingRoutes)
      // So we need a different axios instance or just use a direct path
      const response = await api.post(`../bookings/${bookingRef}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },
};

// Coolie Status Service
export const coolieStatusService = {
  // Go online
  goOnline: async (coolieId, lat, lng) => {
    try {
      const response = await api.post('/coolies/go-online', { coolieId, lat, lng });
      return response.data;
    } catch (error) {
      console.error('Error going online:', error);
      throw error;
    }
  },

  // Go offline
  goOffline: async (coolieId) => {
    try {
      const response = await api.post('/coolies/go-offline', { coolieId });
      return response.data;
    } catch (error) {
      console.error('Error going offline:', error);
      throw error;
    }
  },

  // Get current status
  getStatus: async (coolieId) => {
    try {
      const response = await api.get(`/coolies/status/${coolieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching status:', error);
      throw error;
    }
  },
};

// Export all services
export default {
  coolieProfileService,
  coolieEarningsService,
  coolieLeaderboardService,
  coolieDashboardService,
  coolieStatusService,
};
