import { api } from './api';

export const authService = {
  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    return { token: data.accessToken, user: data.user };
  },
  
  register: async (userData) => {
    const data = await api.post('/auth/register', userData);
    return { token: data.accessToken, user: data.user };
  },
  
  logout: async () => {
    return await api.post('/auth/logout');
  },
  
  verifyOtp: async (phone, otp) => {
    return await api.post('/auth/verify-otp', { phone, otp });
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  refreshToken: async (refreshToken) => {
    return await api.post('/auth/refresh-token', { refreshToken });
  }
};
