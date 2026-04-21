import { api } from './api';

export const chatService = {
  getConversations: async () => {
    return await api.get('/conversations');
  },

  getMessages: async (id, page = 1) => {
    return await api.get(`/conversations/${id}/messages?page=${page}`);
  },

  sendMessage: async (id, content) => {
    return await api.post(`/conversations/${id}/messages`, { content });
  },

  createConversation: async (participantId) => {
    return await api.post('/conversations', { participantId });
  }
};
