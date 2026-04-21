import { Router } from 'express';
import * as ctrl from './marketplace.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

// middleware to optionally verify token for public routes that can show "saved" state
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth) return verifyToken(req, res, next);
  next();
};

router.get('/', optionalAuth, ctrl.getListings);
router.get('/saved', verifyToken, ctrl.getSavedListings);
router.get('/:id', optionalAuth, ctrl.getListingById);
router.post('/:id/view', ctrl.incrementView);

router.post('/', verifyToken, upload.array('images', 6), ctrl.createListing);
router.put('/:id', verifyToken, ctrl.updateListing);
router.delete('/:id', verifyToken, ctrl.deleteListing);

router.post('/:id/save', verifyToken, ctrl.toggleSave);
router.post('/:id/offer', verifyToken, ctrl.sendOffer);

export default router;
