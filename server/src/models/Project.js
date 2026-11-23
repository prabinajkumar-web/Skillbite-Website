// server/src/models/Project.js
import pool from '../config/db.js';

export const Project = {
  create: async (learnerId, data) => {
    const { title, description, project_type, deadline, amount } = data;
    const [result] = await pool.query(
      `INSERT INTO project_requests (learner_id, title, description, project_type, deadline, amount) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [learnerId, title, description, project_type || null, deadline || null, amount || 0]
    );
    return result.insertId;
  },

  getLearnerProjects: async (learnerId) => {
    const [rows] = await pool.query(`
      SELECT pr.*, u.name AS trainer_name 
      FROM project_requests pr
      LEFT JOIN trainer_profiles tp ON tp.id = pr.trainer_id
      LEFT JOIN users u ON u.id = tp.user_id
      WHERE pr.learner_id = ? ORDER BY pr.created_at DESC
    `, [learnerId]);
    return rows;
  },

  getOpenProjects: async () => {
    const [rows] = await pool.query(`
      SELECT pr.*, u.name AS learner_name, u.city AS learner_city
      FROM project_requests pr
      JOIN users u ON u.id = pr.learner_id
      WHERE pr.status = 'open' ORDER BY pr.created_at DESC
    `);
    return rows;
  },

  getTrainerProjects: async (trainerId) => {
    const [rows] = await pool.query(`
      SELECT pr.*, u.name AS learner_name 
      FROM project_requests pr
      JOIN users u ON u.id = pr.learner_id
      WHERE pr.trainer_id = ? ORDER BY pr.created_at DESC
    `, [trainerId]);
    return rows;
  },

  acceptProject: async (projectId, trainerId) => {
    const [result] = await pool.query(
      `UPDATE project_requests SET trainer_id = ?, status = 'accepted' 
       WHERE id = ? AND status = 'open'`,
      [trainerId, projectId]
    );
    return result.affectedRows > 0;
  },

  updateStatus: async (projectId, trainerId, status) => {
    await pool.query(
      `UPDATE project_requests SET status = ? WHERE id = ? AND trainer_id = ?`,
      [status, projectId, trainerId]
    );
  }
};