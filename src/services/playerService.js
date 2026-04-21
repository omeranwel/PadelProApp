import { api } from './api';

export const playerService = {
  getPlayers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/players?${params}`);
  },

  getPlayerById: async (id) => {
    return await api.get(`/players/${id}`);
  },

  updateProfile: async (profileData) => {
    return await api.put('/players/me', profileData);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await api.post('/players/me/avatar', formData, true);
  },

  // Matchmaking
  getRequests: async (type = 'received') => {
    return await api.get(`/match-requests?type=${type}`);
  },

  sendRequest: async (receiverId, message) => {
    return await api.post('/match-requests', { receiverId, message });
  },

  updateRequest: async (id, status) => {
    return await api.patch(`/match-requests/${id}`, { status });
  },

  cancelRequest: async (id) => {
    return await api.delete(`/match-requests/${id}`);
  }
};
