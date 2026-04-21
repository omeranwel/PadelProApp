import { api } from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    const data = await api.post('/bookings', bookingData);
    return {
      success: true,
      bookingRef: data.bookingRef,
      booking: data
    };
  },

  getUserBookings: async (tab) => {
    // tab: upcoming | past | cancelled
    return await api.get(`/bookings?status=${tab}`);
  },

  cancelBooking: async (id) => {
    return await api.patch(`/bookings/${id}/cancel`);
  }
};
