import { create } from 'zustand';
import { mockCourts } from '../data/mockCourts';

export const useCourtsStore = create((set) => ({
  courts: mockCourts,
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
  
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  setSelectedCourt: (court) => set({ selectedCourt: court }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
