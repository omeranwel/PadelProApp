import { Router } from 'express';
import * as ctrl from './players.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

router.get('/', verifyToken, ctrl.getPlayers);
router.get('/:id', verifyToken, ctrl.getPlayerById);
router.put('/me', verifyToken, ctrl.updateProfile);
router.post('/me/avatar', verifyToken, upload.single('avatar'), ctrl.uploadAvatar);

export default router;
