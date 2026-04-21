import { Router } from 'express';
import { register, login, logout, refreshToken, verifyOtp, forgotPassword } from './auth.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema, otpSchema } from './auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', verifyToken, logout);
router.post('/refresh-token', refreshToken);
router.post('/verify-otp', validate(otpSchema), verifyOtp);
router.post('/forgot-password', forgotPassword);

export default router;
