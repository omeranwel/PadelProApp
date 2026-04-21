import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      authError: null,

      login: async (email, password) => {
        set({ authError: null });
        try {
          const data = await authService.login(email, password);
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken || null,
            isLoggedIn: true,
            authError: null
          });
          return { success: true };
        } catch (err) {
          set({ authError: err.message });
          return { success: false, error: err.message };
        }
      },

      register: async (userData) => {
        set({ authError: null });
        try {
          const data = await authService.register(userData);
          set({
            user: data.user,
            token: data.token,
            isLoggedIn: true,
            authError: null
          });
          return { success: true };
        } catch (err) {
          set({ authError: err.message });
          return { success: false, error: err.message };
        }
      },

      logout: async () => {
        try { await authService.logout(); } catch (_) {}
        set({ user: null, token: null, refreshToken: null, isLoggedIn: false, authError: null });
      },

      clearError: () => set({ authError: null })
    }),
    {
      name: 'padelpro-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isLoggedIn: state.isLoggedIn })
    }
  )
);
