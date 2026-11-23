// server/src/controllers/message.controller.js
import { Message } from '../models/Message.js';
import catchAsync from '../utils/catchAsync.js';
import { ok } from '../utils/response.js';

export const sendMessage = catchAsync(async (req, res) => {
  const { receiver_id, message } = req.body;
  await Message.send(req.user.id, receiver_id, message);
  ok(res, null, 'Message sent');
});

export const getChat = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const messages = await Message.getChat(req.user.id, userId);
  ok(res, messages, 'Chat fetched');
});

export const getConversations = catchAsync(async (req, res) => {
  const convos = await Message.getConversations(req.user.id);
  ok(res, convos, 'Conversations fetched');
});

// புதுசா ஆட் பண்ணியிருக்கேன்
export const getUnreadCount = catchAsync(async (req, res) => {
  const count = await Message.getUnreadCount(req.user.id);
  ok(res, count, 'Unread count fetched');
});