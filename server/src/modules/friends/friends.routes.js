import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.js';
import * as ctrl from './friends.controller.js';

const router = Router();
router.use(verifyToken);

router.post('/request', ctrl.sendRequest);
router.patch('/request/:requestId', ctrl.respondRequest);
router.get('/', ctrl.getFriends);
router.get('/requests', ctrl.getRequests);
router.delete('/:friendId', ctrl.removeFriend);

export default router;
