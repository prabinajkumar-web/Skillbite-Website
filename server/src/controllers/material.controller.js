// server/src/controllers/material.controller.js
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { Material } from '../models/Material.js';
import { Trainer } from '../models/Trainer.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js'; // <-- Cloudinary Import

export const uploadMaterial = catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'PDF file is required');
  
  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  if (!tpId) throw new ApiError(404, 'Trainer profile not found');

  // Cloudinary-க்கு PDF-ஐ அப்லோட் பண்றோம்
  const pdf_url = await uploadToCloudinary(req.file.buffer, 'skillbite/materials');
  
  const materialId = await Material.create(tpId, {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    category_id: req.body.category_id,
    skill_id: req.body.skill_id,
    pdf_url
  });

  ok(res, { id: materialId, pdf_url }, 'Material uploaded', 201);
});

export const listMaterials = catchAsync(async (req, res) => {
  const rows = await Material.getAll(req.query);
  ok(res, rows, 'Materials fetched');
});

export const myUploads = catchAsync(async (req, res) => {
  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  if (!tpId) throw new ApiError(404, 'Trainer profile not found');
  
  const rows = await Material.getMyUploads(tpId);
  ok(res, rows, 'My uploads');
});

export const buyMaterial = catchAsync(async (req, res) => {
  const [material] = await pool.query('SELECT price FROM materials WHERE id = ?', [req.params.id]);
  if (!material.length) throw new ApiError(404, 'Material not found');

  try {
    await Material.buy(req.params.id, req.user.id, material[0].price);
    ok(res, null, 'Purchased successfully', 201);
  } catch (e) {
    if (e.message === 'Already purchased') throw new ApiError(409, 'You already own this material');
    throw e;
  }
});

export const myPurchases = catchAsync(async (req, res) => {
  const rows = await Material.getMyPurchases(req.user.id);
  ok(res, rows, 'My purchases');
});