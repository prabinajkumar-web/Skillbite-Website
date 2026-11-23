// server/src/routes/booking.routes.js
import { Router } from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getLearnerUpcoming, 
  getTrainerBookings, 
  updateBookingStatus, 
  getTrainerEarnings 
} from '../controllers/booking.controller.js';
import { protect, roleCheck } from '../middleware/auth.js';

const router = Router();

// --- Learner Routes ---
// லேர்னர் புது புக்கிங் போட
router.post('/', protect, roleCheck('learner'), createBooking);

// லேர்னர் தான் புக் பண்ண எல்லாத்தையும் பார்க்க
router.get('/', protect, roleCheck('learner'), getMyBookings);

// லேர்னருக்கு வரவிருக்கும் (Upcoming) க்ளாஸ்களை காட்ட
router.get('/upcoming', protect, roleCheck('learner'), getLearnerUpcoming);


// --- Trainer Routes ---
// ட்ரைனர் தனக்கு வர்ற புக்கிங் ரிக்வெஸ்ட்டை பார்க்க
router.get('/trainer', protect, roleCheck('trainer'), getTrainerBookings);

// ட்ரைனர் சம்பாதித்த விவரங்களை பார்க்க
router.get('/earnings', protect, roleCheck('trainer'), getTrainerEarnings);

// ட்ரைனர் புக்கிங்கை Accept / Reject / Complete பண்ண
router.patch('/:id/status', protect, roleCheck('trainer'), updateBookingStatus);

export default router;