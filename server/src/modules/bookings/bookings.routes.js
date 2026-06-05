import { Router } from 'express';
import * as ctrl from './bookings.controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();
console.log('📦 Bookings routes module loaded');
router.use((req, res, next) => {
  console.log('[BOOKINGS ROUTES] incoming', req.method, req.originalUrl, req.baseUrl, req.path);
  next();
});

router.post('/', verifyToken, ctrl.createBooking);
router.get('/', verifyToken, ctrl.getUserBookings);
router.get('/:id', verifyToken, ctrl.getBookingById);
router.patch('/:id/cancel', verifyToken, ctrl.cancelBooking);
router.patch('/:id/reschedule', verifyToken, ctrl.rescheduleBooking);

export default router;
