import { create } from 'zustand';
import { courtService } from '../services/courtService';

export const useCourtsStore = create((set, get) => ({
  courts: [],
  loading: false,
  error: null,
  filters: {
    surface: 'All',
    priceMax: 10000,
    ratingMin: 0,
    availability: 'Any',
    sort: 'Distance'
  },
  selectedCourt: null,
  selectedSlot: null,
  selectedDate: new Date(),

  fetchCourts: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await courtService.getCourts(filters);
      set({ courts: data, loading: false });
    } catch (err) {
      console.error('Failed to fetch courts:', err);
      // fallback to empty so we know it's a real API issue
      set({ error: err.message, loading: false });
    }
  },

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  setSelectedCourt: (court) => set({ selectedCourt: court }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
