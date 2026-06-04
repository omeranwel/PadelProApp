import { api } from './api';

export const playerService = {
  getPlayers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/matchmaking/players?${params}`);
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
  getRequests: async (type = 'received') => api.get(`/matchmaking?type=${type}`),
  sendRequest: async (receiverId, message) => api.post('/matchmaking', { receiverId, message }),
  updateRequest: async (id, status) => api.patch(`/matchmaking/${id}`, { status }),
  cancelRequest: async (id) => api.delete(`/matchmaking/${id}`),
};
