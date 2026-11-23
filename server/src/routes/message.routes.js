// server/src/routes/message.routes.js
import { Router } from 'express';
import { sendMessage, getChat, getConversations, getUnreadCount } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount); // <-- இதை ஆட் பண்ணுங்க
router.post('/', sendMessage);
router.get('/:userId', getChat);

export default router;