// server/src/routes/customRequest.routes.js
import { Router } from 'express';
import { createRequest, getOpenRequests, getMyRequests } from '../controllers/customRequest.controller.js';
import { protect, roleCheck } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/', roleCheck('learner'), createRequest);
router.get('/my-requests', roleCheck('learner'), getMyRequests);
router.get('/open', roleCheck('trainer'), getOpenRequests);

export default router;