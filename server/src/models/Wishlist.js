// server/src/models/Wishlist.js
import pool from '../config/db.js';

export const Wishlist = {
  add: async (learnerId, trainerId) => {
    await pool.query(
      'INSERT IGNORE INTO wishlist (learner_id, trainer_id) VALUES (?, ?)',
      [learnerId, trainerId]
    );
  },
  
  remove: async (learnerId, trainerId) => {
    await pool.query(
      'DELETE FROM wishlist WHERE learner_id = ? AND trainer_id = ?',
      [learnerId, trainerId]
    );
  },
  
  getMyWishlist: async (learnerId) => {
    const [rows] = await pool.query(`
      SELECT tp.id, tp.user_id, u.name, u.city, tp.hourly_rate, tp.offer_text, tp.discount_percentage, tp.avg_rating,
             GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS skills
      FROM wishlist w
      JOIN trainer_profiles tp ON tp.id = w.trainer_id
      JOIN users u ON u.id = tp.user_id
      LEFT JOIN trainer_skills ts ON ts.trainer_id = tp.id
      LEFT JOIN skills s ON s.id = ts.skill_id
      WHERE w.learner_id = ?
      GROUP BY tp.id
    `, [learnerId]);
    return rows;
  },

  checkStatus: async (learnerId, trainerId) => {
    const [rows] = await pool.query(
      'SELECT id FROM wishlist WHERE learner_id = ? AND trainer_id = ?',
      [learnerId, trainerId]
    );
    return rows.length > 0;
  }
};