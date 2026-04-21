import { create } from 'zustand';
import { bookingService } from '../services/bookingService';

export const useBookingStore = create((set) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchUserBookings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await bookingService.getUserBookings();
      set({ bookings: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createBooking: async (bookingData) => {
    try {
      const data = await bookingService.createBooking(bookingData);
      set((state) => ({ bookings: [...state.bookings, data] }));
      return { success: true, booking: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  
  cancelBooking: async (id) => {
    try {
      await bookingService.cancelBooking(id);
      set((state) => ({
        bookings: state.bookings.filter(b => b.id !== id) // or map to status cancelled
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}));
