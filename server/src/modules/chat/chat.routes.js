import { Router } from 'express';
import * as ctrl from './chat.controller.js';
import { verifyToken } from '../../middleware/auth.js';

import { sanitizeBody } from '../../middleware/sanitize.js';

const router = Router();

router.get('/', verifyToken, ctrl.getConversations);
router.post('/', verifyToken, ctrl.createConversation);

router.get('/:id/messages', verifyToken, ctrl.getMessages);
router.post('/:id/messages', verifyToken, sanitizeBody(['content']), ctrl.sendMessage);

export default router;
