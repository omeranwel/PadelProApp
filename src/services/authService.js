import { api } from './api';

export const authService = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },
  logout: async () => {
    return await api.post('/auth/logout');
  },
  verifyOtp: async (email, otp) => {
    return await api.post('/auth/verify-otp', { email, otp });
  },
  resendOtp: async (email) => {
    return await api.post('/auth/resend-otp', { email });
  },
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },
  refreshToken: async (refreshToken) => {
    return await api.post('/auth/refresh-token', { refreshToken });
  }
};
