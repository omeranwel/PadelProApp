import { api } from './api';

export const bookingService = {
  getUserBookings: async () => {
    return await api.get('/bookings');
  },
  
  getBookingById: async (id) => {
    return await api.get(`/bookings/${id}`);
  },

  createBooking: async (bookingData) => {
    return await api.post('/bookings', bookingData);
  },

  cancelBooking: async (id) => {
    return await api.patch(`/bookings/${id}/cancel`);
  }
};
