// server/src/models/Material.js
import pool from '../config/db.js';

export const Material = {
  create: async (trainerId, data) => {
    const { title, description, price, category_id, skill_id, pdf_url } = data;
    const [result] = await pool.query(
      `INSERT INTO materials (trainer_id, category_id, skill_id, title, description, price, pdf_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [trainerId, category_id || null, skill_id || null, title, description || null, price, pdf_url]
    );
    return result.insertId;
  },

  getAll: async (filters = {}) => {
    let sql = `
      SELECT m.*, u.name AS trainer_name 
      FROM materials m 
      JOIN trainer_profiles tp ON tp.id = m.trainer_id
      JOIN users u ON u.id = tp.user_id
    `;
    const params = [];
    if (filters.q) { sql += ' WHERE m.title LIKE ?'; params.push(`%${filters.q}%`); }
    sql += ' ORDER BY m.created_at DESC';
    
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  getMyUploads: async (trainerId) => {
    const [rows] = await pool.query('SELECT * FROM materials WHERE trainer_id = ? ORDER BY created_at DESC', [trainerId]);
    return rows;
  },

  buy: async (materialId, learnerId, price) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      const [existing] = await conn.query('SELECT id FROM material_purchases WHERE material_id = ? AND learner_id = ?', [materialId, learnerId]);
      if (existing.length) throw new Error('Already purchased');

      await conn.query('INSERT INTO material_purchases (material_id, learner_id, amount) VALUES (?, ?, ?)', [materialId, learnerId, price]);
      await conn.query('UPDATE materials SET total_sales = total_sales + 1 WHERE id = ?', [materialId]);
      
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  getMyPurchases: async (learnerId) => {
    const [rows] = await pool.query(`
      SELECT m.*, u.name AS trainer_name, mp.purchased_at 
      FROM material_purchases mp
      JOIN materials m ON m.id = mp.material_id
      JOIN trainer_profiles tp ON tp.id = m.trainer_id
      JOIN users u ON u.id = tp.user_id
      WHERE mp.learner_id = ? ORDER BY mp.purchased_at DESC
    `, [learnerId]);
    return rows;
  }
};