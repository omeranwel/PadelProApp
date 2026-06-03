import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import * as ctrl from './admin.controller.js';

const router = Router();
router.use(verifyToken, requireRole('APP_ADMIN'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getUsers);
router.patch('/users/:id', ctrl.patchUser);
router.delete('/users/:id', ctrl.removeUser);
router.get('/courts', ctrl.getCourts);
router.patch('/courts/:id', ctrl.patchCourt);
router.get('/clubs', ctrl.getClubs);
router.patch('/clubs/:id', ctrl.patchClub);
router.get('/bookings', ctrl.getBookings);
router.get('/tournaments', ctrl.getTournaments);
router.get('/reports', ctrl.getReports);

export default router;
