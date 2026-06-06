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
};
