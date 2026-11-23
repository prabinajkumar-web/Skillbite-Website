// server/src/routes/wishlist.routes.js
import { Router } from 'express';
import { addToWishlist, removeFromWishlist, getMyWishlist, checkWishlistStatus } from '../controllers/wishlist.controller.js';
import { protect, roleCheck } from '../middleware/auth.js';

const router = Router();
router.use(protect, roleCheck('learner'));

router.get('/', getMyWishlist);
router.post('/', addToWishlist);
router.delete('/:trainerId', removeFromWishlist);
router.get('/check/:trainerId', checkWishlistStatus);

export default router;