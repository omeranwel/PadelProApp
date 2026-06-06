import { Router } from 'express';
import * as ctrl from './clubs.controller.js';
import * as ownerCtrl from './clubs.owner.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { requireClubOwner } from '../../middleware/requireAdmin.js';

const router = Router();

router.post('/apply', verifyToken, ctrl.applyForClub);
router.get('/my-application', verifyToken, ctrl.getMyApplication);
router.get('/overview', verifyToken, requireClubOwner, ownerCtrl.getClubOverviewFull);
router.get('/bookings', verifyToken, requireClubOwner, ownerCtrl.getClubBookings);
router.patch('/bookings/:id', verifyToken, requireClubOwner, ownerCtrl.updateClubBooking);
router.get('/players', verifyToken, requireClubOwner, ownerCtrl.getClubPlayers);
router.post('/courts', verifyToken, requireClubOwner, ownerCtrl.addCourt);
router.get('/tournaments', verifyToken, requireClubOwner, ownerCtrl.getClubTournaments);
router.post('/tournaments', verifyToken, requireClubOwner, ownerCtrl.addTournament);

export default router;
