import { create } from 'zustand';
import { playerService } from '../services/playerService';

export const useMatchStore = create((set) => ({
  suggestions: [],
  loading: false,
  error: null,
  filters: {
    skillRange: [0, 3], // Beginner to Pro
    lookingFor: 'Both',
    maxDistance: 20
  },
  requests: [], // sent/received requests
  sentRequests: [], // Added to fix ReferenceError reading 'includes'
  
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  
  fetchSuggestions: async () => {
    set({ loading: true, error: null });
    try {
      // Typically you'd pass filters to the service, mapping them as DTO.
      const data = await playerService.getPlayers();
      set({ suggestions: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  sendRequest: async (playerId) => {
    try {
      await playerService.sendRequest(playerId);
      set((state) => ({ 
        requests: [...state.requests, { type: 'sent', to: playerId, status: 'pending' }],
        sentRequests: [...state.sentRequests, playerId]
      }));
    } catch (err) {
      console.error(err);
    }
  }
}));
