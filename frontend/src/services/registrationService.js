import { api } from './authService';

const registrationService = {
  // Register for an event with quantity
  registerForEvent: async (eventId, quantity = 1) => {
    const response = await api.post(`/registrations/registerUserForEvent/${eventId}`, {
      quantity
    });
    return response.data;
  },

  // Get my registrations
  getMyRegistrations: async () => {
    const response = await api.get('/registrations/my-registrations');
    return response.data;
  },

  // Cancel registration
  cancelRegistration: async (eventId) => {
    const response = await api.post(`/registrations/cancelRegistration/${eventId}`);
    return response.data;
  },
};

export default registrationService;
