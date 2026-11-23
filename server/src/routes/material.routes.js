// server/src/routes/material.routes.js
import { Router } from 'express';
import { uploadMaterial, listMaterials, myUploads, buyMaterial, myPurchases } from '../controllers/material.controller.js';
import { protect, roleCheck } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', listMaterials);

// Learner Routes
router.get('/my-purchases', protect, roleCheck('learner'), myPurchases);
router.post('/:id/buy', protect, roleCheck('learner'), buyMaterial);

// Trainer Routes
router.get('/my-uploads', protect, roleCheck('trainer'), myUploads);
router.post('/', protect, roleCheck('trainer'), upload.single('pdf'), uploadMaterial);

export default router;