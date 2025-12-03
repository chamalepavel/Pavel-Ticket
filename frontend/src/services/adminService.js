import { api } from './authService';

const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUserRole: async (userid, role_id) => {
    const response = await api.patch(`/admin/users/${userid}/role`, { role_id });
    return response.data;
  },

  toggleUserStatus: async (userid) => {
    const response = await api.patch(`/admin/users/${userid}/toggle-status`);
    return response.data;
  },

  deleteUser: async (userid) => {
    const response = await api.delete(`/admin/users/${userid}`);
    return response.data;
  },

  // Reports
  getSalesReport: async (params = {}) => {
    const response = await api.get('/admin/reports/sales', { params });
    return response.data;
  },

  getAttendeesReport: async (eventid) => {
    const response = await api.get(`/admin/reports/attendees/${eventid}`);
    return response.data;
  },

  // Categories (admin functions)
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (category_id, categoryData) => {
    const response = await api.put(`/categories/${category_id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (category_id) => {
    const response = await api.delete(`/categories/${category_id}`);
    return response.data;
  },

  // Events (admin functions)
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateEvent: async (eventid, eventData) => {
    const response = await api.put(`/events/${eventid}`, eventData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteEvent: async (eventid) => {
    const response = await api.delete(`/events/${eventid}`);
    return response.data;
  },

  toggleEventStatus: async (eventid) => {
    const response = await api.patch(`/events/${eventid}/toggle-status`);
    return response.data;
  },

  // Event Sales Management
  updateEventSales: async (eventid, salesData) => {
    const response = await api.patch(`/admin/events/${eventid}/sales`, salesData);
    return response.data;
  },

  resetEventSales: async (eventid) => {
    const response = await api.patch(`/admin/events/${eventid}/reset-sales`);
    return response.data;
  },
};

export default adminService;
