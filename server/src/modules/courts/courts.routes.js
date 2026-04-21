import { Router } from 'express';
import * as ctrl from './courts.controller.js';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

router.get('/', ctrl.getCourts);
router.get('/:id', ctrl.getCourtById);
router.get('/:id/availability', ctrl.getAvailability);

router.post('/', verifyToken, requireRole('CLUB_ADMIN', 'APP_ADMIN'), upload.array('images', 5), ctrl.createCourt);
router.put('/:id', verifyToken, requireRole('CLUB_ADMIN', 'APP_ADMIN'), ctrl.updateCourt);
router.delete('/:id', verifyToken, requireRole('CLUB_ADMIN', 'APP_ADMIN'), ctrl.deleteCourt);

router.post('/:id/reviews', verifyToken, ctrl.addReview);

export default router;
