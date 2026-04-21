import { api } from './api';

export const notificationService = {
  getNotifications: async () => {
    return await api.get('/notifications');
  },

  markAllRead: async () => {
    return await api.patch('/notifications/read-all');
  },

  markOneRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  },

  delete: async (id) => {
    return await api.delete(`/notifications/${id}`);
  }
};
