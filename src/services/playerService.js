import { api } from './api';

export const playerService = {
  getPlayers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/players?${params}`);
    return res.players || res;
  },
  getPlayerById: async (id) => api.get(`/players/${id}`),
  updateProfile: async (profileData) => api.put('/players/me', profileData),
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/players/me/avatar', formData, true);
  },
  getLeaderboard: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/players/leaderboard?${params}`);
  },
  logMatch: async (data) => api.post('/players/me/log-match', data),
  getMyStats: async () => api.get('/players/me/stats'),
  getRequests: async (type = 'received') => api.get(`/friends/requests`), // Note: friends API only returns pending received requests by default, but we can adjust if needed
  sendRequest: async (receiverId, message) => api.post('/friends/request', { receiverId, message }),
  updateRequest: async (id, status) => api.post(`/friends/respond/${id}`, { action: status === 'accepted' ? 'accept' : 'decline' }),
  cancelRequest: async (id) => api.post(`/friends/respond/${id}`, { action: 'decline' }),
};
