// server/src/controllers/customRequest.controller.js
import { CustomRequest } from '../models/CustomRequest.js';
import catchAsync from '../utils/catchAsync.js';
import { ok } from '../utils/response.js';

export const createRequest = catchAsync(async (req, res) => {
  await CustomRequest.create(req.user.id, req.body);
  ok(res, null, 'Custom request posted', 201);
});

export const getOpenRequests = catchAsync(async (req, res) => {
  const rows = await CustomRequest.getOpenRequests();
  ok(res, rows, 'Open requests fetched');
});

export const getMyRequests = catchAsync(async (req, res) => {
  const rows = await CustomRequest.getMyRequests(req.user.id);
  ok(res, rows, 'My requests fetched');
});