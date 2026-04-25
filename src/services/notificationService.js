import { api } from './api';

export const notificationService = {
  getAll: async () => { const res = await api.get('/notifications'); return res.data; },
  markAllRead: async () => { const res = await api.patch('/notifications/read-all'); return res.data; },
};
