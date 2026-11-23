// server/src/controllers/admin.controller.js
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';

// 1. Stats (Platform Overview)
export const getStats = catchAsync(async (req, res) => {
  const [[users]] = await pool.query('SELECT COUNT(*) AS total FROM users WHERE role != "admin"');
  const [[trainers]] = await pool.query('SELECT COUNT(*) AS total FROM trainer_profiles');
  const [[bookings]] = await pool.query('SELECT COUNT(*) AS total FROM bookings');
  
  // Total Revenue (Completed Bookings + Material Sales)
  const [[bookingRevenue]] = await pool.query('SELECT SUM(amount) AS total FROM bookings WHERE status = "completed"');
  const [[materialRevenue]] = await pool.query('SELECT SUM(amount) AS total FROM material_purchases');
  
  const totalRevenue = Number(bookingRevenue.total || 0) + Number(materialRevenue.total || 0);

  const [[pending]] = await pool.query('SELECT COUNT(*) AS count FROM trainer_profiles WHERE verification_status = "pending"');

  ok(res, {
    users: users.total,
    trainers: trainers.total,
    bookings: bookings.total,
    revenue: totalRevenue,
    pendingVerifications: pending.count
  }, 'Admin stats fetched');
});

// 2. Manage Users
export const getAllUsers = catchAsync(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, email, role, city, created_at FROM users WHERE role != "admin" ORDER BY created_at DESC');
  ok(res, rows, 'All users fetched');
});

export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM users WHERE id = ? AND role != "admin"', [id]);
  ok(res, null, 'User deleted successfully');
});

// 3. Manage Categories & Skills
export const addCategory = catchAsync(async (req, res) => {
  const { name, icon } = req.body;
  if (!name) throw new ApiError(400, 'Category name required');
  await pool.query('INSERT INTO categories (name, icon) VALUES (?, ?)', [name, icon || '📚']);
  ok(res, null, 'Category added', 201);
});

export const deleteCategory = catchAsync(async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  ok(res, null, 'Category deleted');
});

export const addSkill = catchAsync(async (req, res) => {
  const { category_id, name, description } = req.body;
  if (!category_id || !name) throw new ApiError(400, 'Category and Skill name required');
  await pool.query(
    'INSERT INTO skills (category_id, name, description) VALUES (?, ?, ?)',
    [category_id, name, description || null]
  );
  ok(res, null, 'Skill added', 201);
});

export const deleteSkill = catchAsync(async (req, res) => {
  await pool.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
  ok(res, null, 'Skill deleted');
});

// 4. Monitor Bookings
export const getAllBookings = catchAsync(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT b.*, l.name AS learner_name, t.name AS trainer_name 
    FROM bookings b
    JOIN users l ON l.id = b.learner_id
    JOIN trainer_profiles tp ON tp.id = b.trainer_id
    JOIN users t ON t.id = tp.user_id
    ORDER BY b.created_at DESC
  `);
  ok(res, rows, 'All bookings fetched');
});

// 5. Verify Trainers (Existing)
export const getPendingTrainers = catchAsync(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT tp.id, tp.user_id, tp.verification_status, tp.bio, tp.hourly_rate, u.name, u.email, u.city,
           GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS skills
    FROM trainer_profiles tp
    JOIN users u ON u.id = tp.user_id
    LEFT JOIN trainer_skills ts ON ts.trainer_id = tp.id
    LEFT JOIN skills s ON s.id = ts.skill_id
    WHERE tp.verification_status = 'pending'
    GROUP BY tp.id
  `);
  ok(res, rows, 'Pending trainers fetched');
});

export const verifyTrainer = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw new ApiError(400, 'Invalid status');
  await pool.query('UPDATE trainer_profiles SET verification_status = ? WHERE id = ?', [status, req.params.id]);
  ok(res, null, `Trainer ${status}`);
});