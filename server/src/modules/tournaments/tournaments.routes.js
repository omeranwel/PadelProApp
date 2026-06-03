import { Router } from 'express';
import * as ctrl from './tournaments.controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();
router.get('/', ctrl.getTournaments);
router.get('/:id', ctrl.getTournamentById);
router.post('/', verifyToken, ctrl.createTournament);
router.post('/:id/register', verifyToken, ctrl.registerForTournament);
export default router;
