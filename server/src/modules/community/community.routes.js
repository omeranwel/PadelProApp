import { Router } from 'express';
import * as ctrl from './community.controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

router.get('/', ctrl.getPosts);
router.post('/', verifyToken, upload.single('cover'), ctrl.createPost);
router.post('/:id/like', verifyToken, ctrl.toggleLike);

router.get('/:id/replies', ctrl.getReplies);
router.post('/:id/replies', verifyToken, ctrl.createReply);

export default router;
