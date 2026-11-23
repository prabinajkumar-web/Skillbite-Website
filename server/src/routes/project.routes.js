// server/src/routes/project.routes.js
import { Router } from 'express';
import * as c from '../controllers/project.controller.js';
import { protect, roleCheck } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// Learner Routes
router.post('/', roleCheck('learner'), c.createProject);
router.get('/my-requests', roleCheck('learner'), c.getLearnerProjects);

// Trainer Routes
router.get('/open', roleCheck('trainer'), c.getOpenProjects);
router.get('/my-projects', roleCheck('trainer'), c.getTrainerProjects);
router.patch('/:id/accept', roleCheck('trainer'), c.acceptProject);
router.patch('/:id/status', roleCheck('trainer'), c.updateProjectStatus);

export default router;