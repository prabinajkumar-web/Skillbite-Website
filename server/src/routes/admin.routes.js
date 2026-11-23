// server/src/routes/admin.routes.js
import { Router } from 'express';
import * as c from '../controllers/admin.controller.js';
import { protect, roleCheck } from '../middleware/auth.js';

const router = Router();
router.use(protect, roleCheck('admin'));

router.get('/stats', c.getStats);

// Users
router.get('/users', c.getAllUsers);
router.delete('/users/:id', c.deleteUser);

// Categories & Skills
router.post('/categories', c.addCategory);
router.delete('/categories/:id', c.deleteCategory);
router.post('/skills', c.addSkill);
router.delete('/skills/:id', c.deleteSkill);

// Bookings
router.get('/bookings', c.getAllBookings);

// Verification
router.get('/pending-trainers', c.getPendingTrainers);
router.patch('/verify-trainer/:id', c.verifyTrainer);

export default router;