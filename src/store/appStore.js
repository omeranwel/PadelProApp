import { create } from 'zustand';

export const useAppStore = create((set) => ({
  authModalOpen: false,
  authModalTab: 'signin', // 'signin' or 'register'
  notifications: [],
  globalLoading: false,
  intendedPath: null,
  
  setIntendedPath: (path) => set({ intendedPath: path }),
  clearIntendedPath: () => set({ intendedPath: null }),
  
  openAuthModal: (tab = 'signin') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  
  addNotification: (notification) => 
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  clearNotifications: () => set({ notifications: [] }),
  
  setGlobalLoading: (isLoading) => set({ globalLoading: isLoading }),
}));
