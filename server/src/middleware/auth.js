import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { verifyToken } from '../utils/jwt.js';
import pool from '../config/db.js';

export const protect = catchAsync(async (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) throw new ApiError(401, 'Not authenticated');
  let payload;
  try { payload = verifyToken(token); } catch { throw new ApiError(401, 'Invalid or expired token'); }
  const [rows] = await pool.query('SELECT id, name, email, role, phone, city FROM users WHERE id = ?', [payload.id]);
  if (!rows.length) throw new ApiError(401, 'User no longer exists');
  req.user = rows[0];
  next();
});

export const roleCheck = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Not authenticated'));
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'Forbidden'));
  next();
};