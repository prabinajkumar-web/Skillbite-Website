// server/src/models/Trainer.js
import pool from '../config/db.js';

export const Trainer = {
  createProfile: async (conn, userId) => {
    await conn.query('INSERT INTO trainer_profiles (user_id, mode) VALUES (?, ?)', [userId, 'online']);
  },
  
  getProfileIdByUserId: async (userId) => {
    const [rows] = await pool.query('SELECT id FROM trainer_profiles WHERE user_id = ?', [userId]);
    return rows[0]?.id;
  },

  getProfileByUserId: async (userId) => {
    const [rows] = await pool.query(`
      SELECT tp.*, u.name, u.email, u.city 
      FROM trainer_profiles tp 
      JOIN users u ON u.id = tp.user_id 
      WHERE tp.user_id = ?
    `, [userId]);
    return rows[0];
  },

  updateProfile: async (userId, data) => {
    const { bio, hourly_rate, daily_rate, weekly_rate, monthly_rate, experience_years, offer_text, discount_percentage } = data;
    await pool.query(
      `UPDATE trainer_profiles 
       SET bio = ?, hourly_rate = ?, daily_rate = ?, weekly_rate = ?, monthly_rate = ?, experience_years = ?, offer_text = ?, discount_percentage = ?
       WHERE user_id = ?`,
      [bio || null, hourly_rate || 0, daily_rate || 0, weekly_rate || 0, monthly_rate || 0, experience_years || 0, offer_text || null, discount_percentage || 0, userId]
    );
  },

  updateCity: async (userId, city) => {
    await pool.query('UPDATE users SET city = ? WHERE id = ?', [city, userId]);
  },

  getMySkills: async (trainerId) => {
    const [rows] = await pool.query(`
      SELECT s.id, s.name 
      FROM trainer_skills ts 
      JOIN skills s ON s.id = ts.skill_id 
      WHERE ts.trainer_id = ?
    `, [trainerId]);
    return rows;
  },

  addSkill: async (trainerId, skillId) => {
    await pool.query('INSERT IGNORE INTO trainer_skills (trainer_id, skill_id) VALUES (?, ?)', [trainerId, skillId]);
  },

  removeSkill: async (trainerId, skillId) => {
    await pool.query('DELETE FROM trainer_skills WHERE trainer_id = ? AND skill_id = ?', [trainerId, skillId]);
  },

  listAll: async (filters) => {
    let sql = `
      SELECT tp.id, tp.user_id, u.name, u.email, u.city, tp.bio, 
             tp.hourly_rate, tp.daily_rate, tp.weekly_rate, tp.monthly_rate,
             tp.experience_years, tp.mode, tp.avg_rating, tp.total_sessions,
             tp.can_help_projects, tp.verification_status,
             tp.offer_text, tp.discount_percentage, 
             tp.portfolio_images, tp.certificates,
             GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS skills
      FROM trainer_profiles tp
      JOIN users u ON u.id = tp.user_id
      LEFT JOIN trainer_skills ts ON ts.trainer_id = tp.id
      LEFT JOIN skills s ON s.id = ts.skill_id
      WHERE tp.verification_status = 'approved'
    `;
    const params = [];
    const f = filters || {};
    
    if (f.skill_id) { sql += ' AND ts.skill_id = ?'; params.push(f.skill_id); }
    if (f.mode) { sql += ' AND (tp.mode = ? OR tp.mode = "both")'; params.push(f.mode); }
    if (f.city) { sql += ' AND u.city = ?'; params.push(f.city); }
    if (f.q) { sql += ' AND (u.name LIKE ? OR tp.bio LIKE ?)'; const p = '%' + f.q + '%'; params.push(p, p); }
    
    sql += ' GROUP BY tp.id ORDER BY tp.avg_rating DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }
};