// server/src/controllers/category.controller.js
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import { ok } from '../utils/response.js';

export const listCategories = catchAsync(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, icon FROM categories ORDER BY name');
  ok(res, rows, 'Categories fetched');
});