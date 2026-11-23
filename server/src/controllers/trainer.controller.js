// server/src/controllers/trainer.controller.js
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { Trainer } from '../models/Trainer.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js'; // <-- Cloudinary Import

export const listTrainers = catchAsync(async (req, res) => {
  const rows = await Trainer.listAll(req.query);
  ok(res, rows, 'Trainers');
});

export const getAllSkills = catchAsync(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM skills ORDER BY name');
  ok(res, rows, 'All skills');
});

export const getMyProfile = catchAsync(async (req, res) => {
  let profile = await Trainer.getProfileByUserId(req.user.id);
  if (!profile) {
    await pool.query('INSERT INTO trainer_profiles (user_id, mode) VALUES (?, ?)', [req.user.id, 'online']);
    profile = await Trainer.getProfileByUserId(req.user.id);
  }
  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  const skills = await Trainer.getMySkills(tpId);
  ok(res, { ...profile, mySkills: skills }, 'My profile');
});

export const updateProfile = catchAsync(async (req, res) => {
  const { bio, hourly_rate, daily_rate, weekly_rate, monthly_rate, experience_years, city, offer_text, discount_percentage } = req.body;
  await Trainer.updateProfile(req.user.id, { bio, hourly_rate, daily_rate, weekly_rate, monthly_rate, experience_years, offer_text, discount_percentage });
  if (city) await Trainer.updateCity(req.user.id, city);
  ok(res, null, 'Profile updated');
});

export const addSkill = catchAsync(async (req, res) => {
  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  if (!tpId) throw new ApiError(404, 'Trainer profile not found');
  await Trainer.addSkill(tpId, req.body.skillId);
  ok(res, null, 'Skill added');
});

export const removeSkill = catchAsync(async (req, res) => {
  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  if (!tpId) throw new ApiError(404, 'Trainer profile not found');
  await Trainer.removeSkill(tpId, req.params.skillId);
  ok(res, null, 'Skill removed');
});

export const addAvailability = catchAsync(async (req, res) => {
  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  if (!tpId) throw new ApiError(404, 'Trainer profile not found');
  const { date, start_time, end_time } = req.body;
  await pool.query(
    'INSERT INTO availability (trainer_id, date, start_time, end_time) VALUES (?,?,?,?)',
    [tpId, date, start_time, end_time]
  );
  ok(res, null, 'Slot added', 201);
});

export const listMyAvailability = catchAsync(async (req, res) => {
  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  if (!tpId) throw new ApiError(404, 'Trainer profile not found');
  const [slots] = await pool.query(
    'SELECT * FROM availability WHERE trainer_id = ? ORDER BY date, start_time',
    [tpId]
  );
  ok(res, slots, 'My availability');
});

export const getAvailability = catchAsync(async (req, res) => {
  const { id } = req.params;
  const [slots] = await pool.query(
    `SELECT * FROM availability 
     WHERE trainer_id = ? AND is_booked = 0 
     AND CONCAT(date, ' ', start_time) > NOW() 
     ORDER BY date, start_time`,
    [id]
  );
  ok(res, slots, 'Availability fetched');
});

// ⭐ Portfolio Images Upload (Cloudinary)
export const uploadPortfolio = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new ApiError(400, 'No images uploaded');
  
  // Upload to Cloudinary
  const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'skillbite/portfolio'));
  const imageUrls = await Promise.all(uploadPromises);
  
  const imageUrlsString = imageUrls.join(',');
  await pool.query('UPDATE trainer_profiles SET portfolio_images = ? WHERE user_id = ?', [imageUrlsString, req.user.id]);
  
  ok(res, { portfolio_images: imageUrlsString }, 'Portfolio updated');
});

// ⭐ Certificates Upload (Cloudinary)
export const uploadCertificates = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new ApiError(400, 'No files uploaded');
  
  // Upload to Cloudinary
  const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'skillbite/certificates'));
  const fileUrls = await Promise.all(uploadPromises);
  
  const fileUrlsString = fileUrls.join(',');
  await pool.query('UPDATE trainer_profiles SET certificates = ? WHERE user_id = ?', [fileUrlsString, req.user.id]);
  
  ok(res, { certificates: fileUrlsString }, 'Certificates updated');
});