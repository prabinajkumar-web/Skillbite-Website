// server/src/routes/trainer.routes.js
import { Router } from 'express';
import * as c from '../controllers/trainer.controller.js';
import { protect, roleCheck } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', c.listTrainers);
router.get('/skills', c.getAllSkills);
router.get('/:id/availability', c.getAvailability);

// Protected routes
router.use(protect, roleCheck('trainer'));

router.get('/profile/me', c.getMyProfile);
router.put('/profile', c.updateProfile);
router.post('/skills', c.addSkill);
router.delete('/skills/:skillId', c.removeSkill);
router.post('/availability', c.addAvailability);
router.get('/availability/me', c.listMyAvailability);

// Upload Routes
router.post('/portfolio', upload.array('portfolio', 3), c.uploadPortfolio);
router.post('/certificates', upload.array('certificates', 3), c.uploadCertificates);

export default router;