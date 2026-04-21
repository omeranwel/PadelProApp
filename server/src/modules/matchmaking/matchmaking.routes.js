import { Router } from 'express';
import * as ctrl from './matchmaking.controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, ctrl.sendRequest);
router.get('/', verifyToken, ctrl.getRequests);
router.patch('/:id', verifyToken, ctrl.updateRequest);
router.delete('/:id', verifyToken, ctrl.cancelRequest);

export default router;
