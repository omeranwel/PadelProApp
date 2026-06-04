import { Router } from 'express';
import * as ctrl from './clubs.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { requireClubOwner } from '../../middleware/requireAdmin.js';

const router = Router();

router.post('/apply', verifyToken, ctrl.applyForClub);
router.get('/my-application', verifyToken, ctrl.getMyApplication);
router.get('/overview', verifyToken, requireClubOwner, ctrl.getClubOverview);

export default router;
