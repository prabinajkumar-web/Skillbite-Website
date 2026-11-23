// server/src/controllers/booking.controller.js
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { Booking } from '../models/Booking.js';

// 1. லேர்னர் புதுசா புக் பண்றது (Quick Doubt & Normal Booking)
export const createBooking = catchAsync(async (req, res) => {
  const { trainer_id, availability_id, package_type, amount } = req.body;
  
  // Quick Doubt-க்கு availability_id இருக்காது. அதனால || null பயன்படுத்துறோம்.
  await Booking.createBooking(req.user.id, trainer_id, availability_id || null, package_type || 'hourly', amount || 0);
  
  ok(res, null, 'Booking successful', 201);
});

// 2. லேர்னர் தான் புக் பண்ண எல்லாத்தையும் பார்ப்பது
export const getMyBookings = catchAsync(async (req, res) => {
  const rows = await Booking.getLearnerBookings(req.user.id);
  ok(res, rows, 'My bookings fetched');
});

// 3. லேர்னர்-க்கு Upcoming Classes-ஐ காட்ட
export const getLearnerUpcoming = catchAsync(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT b.*, u.name AS trainer_name, tp.id AS trainer_id
    FROM bookings b
    JOIN trainer_profiles tp ON tp.id = b.trainer_id
    JOIN users u ON u.id = tp.user_id
    WHERE b.learner_id = ? AND b.status = 'accepted' 
    AND (CONCAT(b.session_date, ' ', b.start_time) >= NOW() OR b.session_date >= CURDATE())
    ORDER BY b.session_date ASC, b.start_time ASC
    LIMIT 3
  `, [req.user.id]);
  ok(res, rows, 'Upcoming classes fetched');
});

// 4. ட்ரைனர் தனக்கு வர்ற புக்கிங்கை பார்ப்பது
export const getTrainerBookings = catchAsync(async (req, res) => {
  const [tp] = await pool.query('SELECT id FROM trainer_profiles WHERE user_id = ?', [req.user.id]);
  if (!tp.length) throw new ApiError(404, 'Trainer profile not found');
  
  const rows = await Booking.getTrainerBookings(tp[0].id);
  ok(res, rows, 'Trainer bookings fetched');
});

// 5. ட்ரைனர் அக்செப்ட் / ரிஜெக்ட் / கம்ப்ளீட் பண்றது
export const updateBookingStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected', 'completed'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const [tp] = await pool.query('SELECT id FROM trainer_profiles WHERE user_id = ?', [req.user.id]);
  if (!tp.length) throw new ApiError(404, 'Trainer not found');

  await Booking.updateStatus(req.params.id, tp[0].id, status);
  ok(res, null, `Booking ${status}`);
});

// 6. ட்ரைனர் தான் சம்பாதித்த பணத்தை பார்ப்பது
export const getTrainerEarnings = catchAsync(async (req, res) => {
  const [tp] = await pool.query('SELECT id FROM trainer_profiles WHERE user_id = ?', [req.user.id]);
  if (!tp.length) throw new ApiError(404, 'Trainer not found');
  
  const earnings = await Booking.getEarnings(tp[0].id);
  ok(res, earnings || { total_earned: 0, pending_amount: 0, completed_sessions: 0 }, 'Earnings fetched');
});
