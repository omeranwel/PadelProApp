import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.js';
import * as ctrl from './reviews.controller.js';

const router = Router();

router.get('/tags', ctrl.getTags);
router.get('/pending', verifyToken, ctrl.getPending);
router.post('/', verifyToken, ctrl.submit);
router.get('/player/:playerId', ctrl.getForPlayer);
router.get('/can-review/:subjectId', verifyToken, ctrl.canReview);

export default router;
