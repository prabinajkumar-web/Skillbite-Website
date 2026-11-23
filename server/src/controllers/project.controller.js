// server/src/controllers/project.controller.js
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { Project } from '../models/Project.js';
import { Trainer } from '../models/Trainer.js';

export const createProject = catchAsync(async (req, res) => {
  const projectId = await Project.create(req.user.id, req.body);
  ok(res, { id: projectId }, 'Project request created', 201);
});

export const getLearnerProjects = catchAsync(async (req, res) => {
  const rows = await Project.getLearnerProjects(req.user.id);
  ok(res, rows, 'My projects fetched');
});

export const getOpenProjects = catchAsync(async (req, res) => {
  const rows = await Project.getOpenProjects();
  ok(res, rows, 'Open projects fetched');
});

export const getTrainerProjects = catchAsync(async (req, res) => {
  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  if (!tpId) throw new ApiError(404, 'Trainer profile not found');
  const rows = await Project.getTrainerProjects(tpId);
  ok(res, rows, 'Trainer projects fetched');
});

export const acceptProject = catchAsync(async (req, res) => {
  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  if (!tpId) throw new ApiError(404, 'Trainer profile not found');

  const success = await Project.acceptProject(req.params.id, tpId);
  if (!success) throw new ApiError(409, 'Project is no longer available or already accepted');
  
  ok(res, null, 'Project accepted');
});

export const updateProjectStatus = catchAsync(async (req, res) => {
  const { status } = req.body; // 'completed' or 'cancelled'
  if (!['completed', 'cancelled'].includes(status)) throw new ApiError(400, 'Invalid status');

  const tpId = await Trainer.getProfileIdByUserId(req.user.id);
  await Project.updateStatus(req.params.id, tpId, status);
  
  ok(res, null, 'Project status updated');
});