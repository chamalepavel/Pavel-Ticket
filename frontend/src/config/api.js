// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  
  // Events
  EVENTS: `${API_BASE_URL}/events`,
  EVENT_BY_ID: (id) => `${API_BASE_URL}/events/${id}`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,
  
  // Tickets
  TICKETS: `${API_BASE_URL}/tickets`,
  TICKET_BY_ID: (id) => `${API_BASE_URL}/tickets/${id}`,
  
  // Registrations
  REGISTRATIONS: `${API_BASE_URL}/registrations`,
  MY_REGISTRATIONS: `${API_BASE_URL}/registrations/my-registrations`,
  REGISTRATION_BY_ID: (id) => `${API_BASE_URL}/registrations/${id}`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  
  // Admin
  ADMIN_DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_USER_ROLE: (id) => `${API_BASE_URL}/admin/users/${id}/role`,
};

export default API_BASE_URL;
