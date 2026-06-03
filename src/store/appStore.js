import { create } from 'zustand';

let toastIdCounter = 0;

export const useAppStore = create((set) => ({
  authModalOpen: false,
  authModalTab: 'signin', // 'signin' or 'register'
  notifications: [],
  unreadCount: 0,
  globalLoading: false,
  intendedPath: null,
  toasts: [],
  
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

  pushToast: (toast, duration = 5000) => {
    const id = ++toastIdCounter;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    if (duration > 0) setTimeout(() => useAppStore.getState().dismissToast(id), duration);
    return id;
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));
