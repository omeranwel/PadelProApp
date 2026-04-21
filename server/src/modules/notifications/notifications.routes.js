import { Router } from 'express';
import * as ctrl from './notifications.controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, ctrl.getNotifications);
router.patch('/read-all', verifyToken, ctrl.markAllRead);
router.patch('/:id/read', verifyToken, ctrl.markOneRead);
router.delete('/:id', verifyToken, ctrl.deleteNotification);

export default router;
