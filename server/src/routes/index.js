// server/src/routes/index.js
import { Router } from 'express';
import auth from './auth.routes.js';
import trainer from './trainer.routes.js';
import booking from './booking.routes.js';
import material from './material.routes.js';
import admin from './admin.routes.js';
import review from './review.routes.js';
import project from './project.routes.js';
import message from './message.routes.js';
import category from './category.routes.js';
import wishlist from './wishlist.routes.js';
import customRequest from './customRequest.routes.js';

const router = Router();

router.use('/auth', auth);
router.use('/trainers', trainer);
router.use('/bookings', booking);
router.use('/materials', material);
router.use('/admin', admin);
router.use('/reviews', review);
router.use('/projects', project);
router.use('/messages', message);
router.use('/categories', category);
router.use('/wishlist', wishlist);
router.use('/custom-requests', customRequest);

export default router;