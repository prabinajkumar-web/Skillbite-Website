import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { signToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { Trainer } from '../models/Trainer.js';

export const register = catchAsync(async (req, res) => {
  const { name, email, password, role, phone, city } = req.body;
  const exists = await User.findByEmail(email);
  if (exists) throw new ApiError(409, 'Email already registered');

  const hash = await bcrypt.hash(password, 10);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const userId = await User.create(conn, { name, email, hash, role, phone, city });
    if (role === 'trainer') await Trainer.createProfile(conn, userId);
    await conn.commit();

    const token = signToken({ id: userId, role });
    ok(res, { token, user: { id: userId, name, email, role } }, 'Registered', 201);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findByEmail(email);
  if (!u) throw new ApiError(401, 'Invalid email or password');
  
  const match = await bcrypt.compare(password, u.password_hash);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const token = signToken({ id: u.id, role: u.role });
  ok(res, { token, user: { id: u.id, name: u.name, email: u.email, role: u.role } }, 'Logged in');
});

export const me = catchAsync(async (req, res) => {
  ok(res, req.user, 'Current user');
});