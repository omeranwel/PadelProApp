import { Router } from 'express';
import * as ctrl from './chatbot.controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, ctrl.chat);

export default router;
