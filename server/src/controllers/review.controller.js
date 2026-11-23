// server/src/controllers/review.controller.js
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { Review } from '../models/Review.js';

export const addReview = catchAsync(async (req, res) => {
  const { booking_id, rating, comment } = req.body;

  // புக்கிங் டீடெயில்ஸ் செக் பண்றோம்
  const [booking] = await pool.query(
    'SELECT trainer_id FROM bookings WHERE id = ? AND learner_id = ?',
    [booking_id, req.user.id]
  );
  if (!booking.length) throw new ApiError(404, 'Booking not found');

  // ஏற்கனவே ரிவியூ கொடுத்துட்டாங்களா-னு செக் பண்றோம்
  const [existing] = await pool.query(
    'SELECT id FROM reviews WHERE booking_id = ?',
    [booking_id]
  );
  if (existing.length) throw new ApiError(409, 'You already reviewed this session');

  await Review.create(req.user.id, booking[0].trainer_id, booking_id, rating, comment);
  ok(res, null, 'Review submitted successfully', 201);
});

export const getTrainerReviews = catchAsync(async (req, res) => {
  const { trainerId } = req.params;
  const reviews = await Review.getTrainerReviews(trainerId);
  ok(res, reviews, 'Trainer reviews fetched');
});