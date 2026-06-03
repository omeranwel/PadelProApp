import * as authService from './auth.service.js';

export const register = async (req, res, next) => {
  try { res.status(201).json(await authService.register(req.body)); } catch(err) { next(err); }
};

export const login = async (req, res, next) => {
  try { res.json(await authService.login(req.body.email, req.body.password)); }
  catch (err) {
    if (err.requiresVerification) return res.status(403).json({ error: err.message, requiresVerification: true, email: req.body.email });
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try { await authService.logout(req.user.id, req.body.refreshToken); res.json({ message: 'Logged out' }); } catch(err) { next(err); }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token required' });
    res.json(await authService.refreshAccessToken(token));
  } catch(err) { next(err); }
};

export const verifyOtp = async (req, res, next) => {
  try { res.json(await authService.verifyOtp(req.body.email, req.body.otp)); } catch(err) { next(err); }
};

export const resendOtp = async (req, res, next) => {
  try { res.json(await authService.resendOtp(req.body.email)); } catch(err) { next(err); }
};

export const forgotPassword = async (req, res, next) => {
  try { await authService.sendPasswordReset(req.body.email); res.json({ message: 'Reset code sent if account exists' }); } catch(err) { next(err); }
};
