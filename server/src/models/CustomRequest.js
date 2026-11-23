// server/src/models/CustomRequest.js
import pool from '../config/db.js';

export const CustomRequest = {
  create: async (learnerId, data) => {
    const { skill_name, description, budget, duration, mode } = data;
    await pool.query(
      `INSERT INTO custom_requests (learner_id, skill_name, description, budget, duration, mode) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [learnerId, skill_name, description || null, budget || 0, duration || null, mode || 'online']
    );
  },

  getOpenRequests: async () => {
    const [rows] = await pool.query(`
      SELECT cr.*, u.name AS learner_name 
      FROM custom_requests cr
      JOIN users u ON u.id = cr.learner_id
      WHERE cr.status = 'open'
      ORDER BY cr.created_at DESC
    `);
    return rows;
  },

  getMyRequests: async (learnerId) => {
    const [rows] = await pool.query(
      'SELECT * FROM custom_requests WHERE learner_id = ? ORDER BY created_at DESC',
      [learnerId]
    );
    return rows;
  }
};