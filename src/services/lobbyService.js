import { api } from './api';

export const lobbyService = {
  // Create a new match lobby (private or open)
  create: (data) => api.post('/lobbies', data),

  // Get lobbies for current user (organized + joined + pending invites)
  getMy: () => api.get('/lobbies/my'),

  // Get open lobbies to browse and join
  getOpen: (city = '') => api.get(`/lobbies/open${city ? `?city=${city}` : ''}`),

  // Accept or decline an invite
  respondToInvite: (inviteId, action, declineReason = '') =>
    api.patch(`/lobbies/invites/${inviteId}`, { action, declineReason }),

  // Request to join an open lobby
  requestJoin: (lobbyId, message = '') => api.post(`/lobbies/${lobbyId}/join`, { message }),

  // Organizer: approve or reject a join request
  respondToJoin: (lobbyId, requestId, action) =>
    api.patch(`/lobbies/${lobbyId}/join/${requestId}`, { action }),

  // Organizer: book a court for a full lobby
  bookCourt: (lobbyId, data) => api.post(`/lobbies/${lobbyId}/book`, data),

  // Cancel a lobby
  cancel: (lobbyId, reason = '') => api.post(`/lobbies/${lobbyId}/cancel`, { reason }),

  // Log match result
  logResult: (matchId, setScores, winnerTeam) =>
    api.post(`/lobbies/matches/${matchId}/result`, { setScores, winnerTeam }),

  // AI: get player suggestions for private match
  aiSuggest: ({ count = 9, excludeIds = [], skillMin, skillMax, city, playingStyle, position } = {}) => {
    const params = new URLSearchParams({ count, excludeIds: excludeIds.join(',') });
    if (skillMin !== undefined) params.set('skillMin', skillMin);
    if (skillMax !== undefined) params.set('skillMax', skillMax);
    if (city)         params.set('city', city);
    if (playingStyle) params.set('playingStyle', playingStyle);
    if (position)     params.set('position', position);
    return api.get(`/matchmaking/suggest?${params}`);
  },

  // AI: live search with match scores
  aiSearch: (q, excludeIds = []) =>
    api.get(`/matchmaking/search?q=${encodeURIComponent(q)}&excludeIds=${excludeIds.join(',')}&limit=8`),
};
