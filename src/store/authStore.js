import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { name: "Sharjeel Chandna", email, role: "player", skillLevel: "intermediate", avatar: null }
      token: null,
      isLoggedIn: false,
      
      login: (email, password) => {
        // Mock login
        set({
          user: { name: 'Sharjeel Chandna', email, role: 'player', skillLevel: 'intermediate', avatar: null },
          token: 'mock-jwt-token-123',
          isLoggedIn: true
        });
      },
      
      register: (userData) => {
        set({
          user: userData,
          token: 'mock-jwt-token-123',
          isLoggedIn: true
        });
      },
      
      logout: () => set({ user: null, token: null, isLoggedIn: false }),
    }),
    {
      name: 'padelpro-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isLoggedIn: state.isLoggedIn })
    }
  )
);
