import { api } from './authService';

const eventService = {
  // Get all events
  getAllEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Get events by category
  getEventsByCategory: async (categoryId) => {
    const response = await api.get('/events', {
      params: { category_id: categoryId }
    });
    return response.data;
  },

  // Create event (admin only)
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Update event (admin only)
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Delete event (admin only)
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get tickets for an event
  getEventTickets: async (eventId) => {
    const response = await api.get('/tickets', {
      params: { event_id: eventId }
    });
    return response.data;
  },
};

export default eventService;
