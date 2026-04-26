import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://coolie-hiring-platform-backend.onrender.com/api/v1';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Dashboard Service
export const adminDashboardService = {
  // Get dashboard stats
  getStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get live bookings
  getLiveBookings: async () => {
    try {
      const response = await api.get('/admin/bookings/live');
      return response.data;
    } catch (error) {
      console.error('Error fetching live bookings:', error);
      throw error;
    }
  },

  // Get revenue data
  getRevenueData: async (period = 'today') => {
    try {
      const response = await api.get(`/admin/revenue/${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  },

  // Get station coverage
  getStationCoverage: async () => {
    try {
      const response = await api.get('/admin/stations/coverage');
      return response.data;
    } catch (error) {
      console.error('Error fetching station coverage:', error);
      throw error;
    }
  },

  // Get urgent disputes
  getUrgentDisputes: async () => {
    try {
      const response = await api.get('/admin/disputes/urgent');
      return response.data;
    } catch (error) {
      console.error('Error fetching urgent disputes:', error);
      throw error;
    }
  },
};

// Admin Users Service
export const adminUsersService = {
  // Get all customers
  getAllCustomers: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/admin/customers?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get all coolies
  getAllCoolies: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/admin/coolies?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coolies:', error);
      throw error;
    }
  },

  // Get pending coolies
  getPendingCoolies: async () => {
    try {
      const response = await api.get('/admin/coolies/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending coolies:', error);
      throw error;
    }
  },

  // Get coolie details
  getCoolieDetails: async (coolieId) => {
    try {
      const response = await api.get(`/admin/coolies/${coolieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coolie details:', error);
      throw error;
    }
  },

  // Approve coolie (Level 1)
  approveCoolieLevel1: async (coolieId) => {
    try {
      const response = await api.post(`/admin/coolies/${coolieId}/approve/level1`);
      return response.data;
    } catch (error) {
      console.error('Error approving coolie level 1:', error);
      throw error;
    }
  },

  // Approve coolie (Level 2 - Final)
  approveCoolieLevel2: async (coolieId) => {
    try {
      const response = await api.post(`/admin/coolies/${coolieId}/approve/level2`);
      return response.data;
    } catch (error) {
      console.error('Error approving coolie level 2:', error);
      throw error;
    }
  },

  // Reject coolie
  rejectCoolie: async (coolieId, reason) => {
    try {
      const response = await api.post(`/admin/coolies/${coolieId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting coolie:', error);
      throw error;
    }
  },

  // Suspend coolie
  suspendCoolie: async (coolieId) => {
    try {
      const response = await api.patch(`/admin/coolies/${coolieId}/suspend`);
      return response.data;
    } catch (error) {
      console.error('Error suspending coolie:', error);
      throw error;
    }
  },

  // Ban customer
  banCustomer: async (customerId) => {
    try {
      const response = await api.patch(`/admin/customers/${customerId}/ban`);
      return response.data;
    } catch (error) {
      console.error('Error banning customer:', error);
      throw error;
    }
  },
};

// Admin Bookings Service
export const adminBookingsService = {
  // Get all bookings
  getAllBookings: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/admin/bookings?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    try {
      const response = await api.get(`/admin/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },
};

// Admin Disputes Service
export const adminDisputesService = {
  // Get all disputes
  getAllDisputes: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/admin/disputes?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching disputes:', error);
      throw error;
    }
  },

  // Get dispute details
  getDisputeDetails: async (disputeId) => {
    try {
      const response = await api.get(`/admin/disputes/${disputeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dispute details:', error);
      throw error;
    }
  },

  // Resolve dispute
  resolveDispute: async (disputeId, resolution) => {
    try {
      const response = await api.post(`/admin/disputes/${disputeId}/resolve`, { resolution });
      return response.data;
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  },
};

// Admin Analytics Service
export const adminAnalyticsService = {
  // Get analytics data
  getAnalytics: async (period = '7d') => {
    try {
      const response = await api.get(`/admin/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Get user growth data
  getUserGrowth: async (period = '30d') => {
    try {
      const response = await api.get(`/admin/analytics/user-growth?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user growth:', error);
      throw error;
    }
  },

  // Get revenue analytics
  getRevenueAnalytics: async (period = '30d') => {
    try {
      const response = await api.get(`/admin/analytics/revenue?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  },

  // Get station performance
  getStationPerformance: async () => {
    try {
      const response = await api.get('/admin/analytics/stations');
      return response.data;
    } catch (error) {
      console.error('Error fetching station performance:', error);
      throw error;
    }
  },
};

// Export all services
export default {
  adminDashboardService,
  adminUsersService,
  adminBookingsService,
  adminDisputesService,
  adminAnalyticsService,
};
