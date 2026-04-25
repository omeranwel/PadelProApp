import { create } from 'zustand';

export const useAppStore = create((set) => ({
  authModalOpen: false,
  authModalTab: 'signin', // 'signin' or 'register'
  notifications: [],
  unreadCount: 0,
  globalLoading: false,
  intendedPath: null,
  
  setIntendedPath: (path) => set({ intendedPath: path }),
  clearIntendedPath: () => set({ intendedPath: null }),
  
  openAuthModal: (tab = 'signin') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  
  addNotification: (notification) => 
    set((state) => {
      const updated = [notification, ...state.notifications];
      return { notifications: updated, unreadCount: updated.filter(n => !n.isRead && !n.read).length };
    }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  setNotifications: (items) => set({ notifications: items, unreadCount: items.filter(n=>!n.isRead && !n.read).length }),
  markAllRead: () => set(state => ({
    notifications: state.notifications.map(n=>({...n, isRead:true, read:true})),
    unreadCount: 0
  })),
  
  setGlobalLoading: (isLoading) => set({ globalLoading: isLoading }),
}));
