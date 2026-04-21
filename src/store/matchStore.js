import { create } from 'zustand';
import { mockPlayers } from '../data/mockPlayers';

export const useMatchStore = create((set) => ({
  suggestions: mockPlayers,
  filters: {
    skillRange: [0, 3], // Beginner to Pro
    lookingFor: 'Both',
    maxDistance: 20
  },
  requests: [], // sent/received requests
  sentRequests: [], // Added to fix ReferenceError reading 'includes'
  
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  sendRequest: (playerId) => {
    // mock send request
    set((state) => ({ 
      requests: [...state.requests, { type: 'sent', to: playerId, status: 'pending' }],
      sentRequests: [...state.sentRequests, playerId]
    }));
  }
}));
