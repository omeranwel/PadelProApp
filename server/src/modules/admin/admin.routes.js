import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import * as ctrl from './admin.controller.js';

const router = Router();
router.use(verifyToken, requireAdmin);

router.get('/overview', ctrl.getOverview);
router.get('/users', ctrl.getUsers);
router.patch('/users/:id', ctrl.patchUser);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/courts', ctrl.getCourts);
router.get('/clubs', ctrl.getClubs);
router.patch('/clubs/:id', ctrl.patchClub);
router.get('/bookings', ctrl.getBookings);
router.patch('/bookings/:id', ctrl.patchBooking);

export default router;
