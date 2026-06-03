import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import * as ctrl from './clubs.controller.js';

const router = Router();

router.get('/', ctrl.getAllClubs);
router.get('/my', verifyToken, requireRole('CLUB_ADMIN'), ctrl.getMyClub);
router.post('/my', verifyToken, requireRole('CLUB_ADMIN'), ctrl.upsertClub);
router.put('/my', verifyToken, requireRole('CLUB_ADMIN'), ctrl.upsertClub);
router.get('/my/stats', verifyToken, requireRole('CLUB_ADMIN'), ctrl.getStats);
router.get('/my/bookings', verifyToken, requireRole('CLUB_ADMIN'), ctrl.getBookings);
router.patch('/my/bookings/:id', verifyToken, requireRole('CLUB_ADMIN'), ctrl.patchBooking);
router.get('/my/courts/:courtId/slots', verifyToken, requireRole('CLUB_ADMIN'), ctrl.getSlots);
router.post('/my/courts/:courtId/slots', verifyToken, requireRole('CLUB_ADMIN'), ctrl.createSlots);
router.get('/my/tournaments', verifyToken, requireRole('CLUB_ADMIN'), ctrl.getTournaments);

export default router;
