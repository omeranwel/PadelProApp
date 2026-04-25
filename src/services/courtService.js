import { api } from './api';

export const courtService = {
  getCourts: async (filters) => {
    // Convert filters object to query string
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/courts?${params}`);
  },

  getCourtById: async (id) => {
    return await api.get(`/courts/${id}`);
  },

  getAvailability: async (id, date) => {
    return await api.get(`/courts/${id}/availability?date=${date}`);
  },

  addReview: async (id, reviewData) => {
    return await api.post(`/courts/${id}/reviews`, reviewData);
  },

  createBooking: async (data) => {
    return await api.post('/bookings', data);
  },

  rescheduleBooking: async (id, newDate, newTime) => {
    return await api.patch(`/bookings/${id}/reschedule`, { date: newDate, startTime: newTime });
  },

  getUserBookings: async (status = 'upcoming') => {
    return await api.get(`/bookings?status=${status}`);
  }
};
