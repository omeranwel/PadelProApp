import * as authService from './auth.service.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id, req.body.refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token required' });
    
    const result = await authService.refreshAccessToken(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyOtp(req.body.phone, req.body.otp);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await authService.sendPasswordReset(req.body.email);
    res.json({ message: 'Reset email sent if account exists' });
  } catch (err) {
    next(err);
  }
};
