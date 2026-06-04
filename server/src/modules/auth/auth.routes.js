import { Router } from 'express';
import { syncUser, sendOtp, verifyOtp } from './auth.controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();

router.post('/sync', verifyToken, syncUser);
router.post('/send-otp', verifyToken, sendOtp);
router.post('/verify-otp', verifyToken, verifyOtp);

export default router;
