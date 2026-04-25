import { Router } from 'express';
import * as ctrl from './bookings.controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, ctrl.createBooking);
router.get('/', verifyToken, ctrl.getUserBookings);
router.get('/:id', verifyToken, ctrl.getBookingById);
router.patch('/:id/cancel', verifyToken, ctrl.cancelBooking);
router.patch('/:id/reschedule', verifyToken, ctrl.rescheduleBooking);

export default router;
