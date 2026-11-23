// server/src/controllers/wishlist.controller.js
import { Wishlist } from '../models/Wishlist.js';
import catchAsync from '../utils/catchAsync.js';
import { ok } from '../utils/response.js';

export const addToWishlist = catchAsync(async (req, res) => {
  await Wishlist.add(req.user.id, req.body.trainer_id);
  ok(res, null, 'Added to wishlist');
});

export const removeFromWishlist = catchAsync(async (req, res) => {
  await Wishlist.remove(req.user.id, req.params.trainerId);
  ok(res, null, 'Removed from wishlist');
});

export const getMyWishlist = catchAsync(async (req, res) => {
  const rows = await Wishlist.getMyWishlist(req.user.id);
  ok(res, rows, 'Wishlist fetched');
});

export const checkWishlistStatus = catchAsync(async (req, res) => {
  const isWished = await Wishlist.checkStatus(req.user.id, req.params.trainerId);
  ok(res, { isWished }, 'Status fetched');
});