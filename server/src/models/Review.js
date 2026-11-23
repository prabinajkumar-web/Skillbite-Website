// server/src/models/Review.js
import pool from '../config/db.js';

export const Review = {
  create: async (learnerId, trainerId, bookingId, rating, comment) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      await conn.query(
        `INSERT INTO reviews (learner_id, trainer_id, booking_id, rating, comment) 
         VALUES (?, ?, ?, ?, ?)`,
        [learnerId, trainerId, bookingId, rating, comment || null]
      );

      // ட்ரைனரோட சராசரி ரேட்டிங்கை அப்டேட் பண்றோம்
      const [avgResult] = await conn.query(
        'SELECT AVG(rating) AS avg_rating FROM reviews WHERE trainer_id = ?',
        [trainerId]
      );

      await conn.query(
        'UPDATE trainer_profiles SET avg_rating = ? WHERE id = ?',
        [avgResult[0].avg_rating || 0, trainerId]
      );

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  getTrainerReviews: async (trainerId) => {
    const [rows] = await pool.query(`
      SELECT r.*, u.name AS learner_name 
      FROM reviews r
      JOIN users u ON u.id = r.learner_id
      WHERE r.trainer_id = ? ORDER BY r.created_at DESC
    `, [trainerId]);
    return rows;
  }
};