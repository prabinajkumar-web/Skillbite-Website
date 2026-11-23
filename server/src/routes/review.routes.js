// server/src/routes/review.routes.js
import { Router } from 'express';
import { addReview, getTrainerReviews } from '../controllers/review.controller.js';
import { protect, roleCheck } from '../middleware/auth.js';

const router = Router();

router.get('/trainer/:trainerId', getTrainerReviews);
router.post('/', protect, roleCheck('learner'), addReview);

export default router;