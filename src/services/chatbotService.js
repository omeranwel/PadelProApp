import { api } from './api';

export const chatbotService = {
  sendMessage: async (message, history = []) => {
    const data = await api.post('/chatbot', { message, history });
    return data.response;
  }
};
