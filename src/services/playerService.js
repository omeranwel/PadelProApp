import { api } from './api';

export const playerService = {
  getPlayers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/players?${params}`);
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
  getRequests: async (type = 'received') => api.get(`/match-requests?type=${type}`),
  sendRequest: async (receiverId, message) => api.post('/match-requests', { receiverId, message }),
  updateRequest: async (id, status) => api.patch(`/match-requests/${id}`, { status }),
  cancelRequest: async (id) => api.delete(`/match-requests/${id}`),
};
