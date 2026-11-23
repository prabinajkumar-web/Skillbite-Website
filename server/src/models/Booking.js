// server/src/models/Booking.js
import pool from '../config/db.js';

export const Booking = {
  createBooking: async (learnerId, trainerId, availabilityId, packageType, amount) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // ⭐ Quick Doubt-க்கு ஸ்லாட் தேவையில்லை. நேரடியா புக் ஆகும்.
      if (packageType === 'quick_doubt') {
        const meetingLink = `https://meet.jit.si/JustLearn-Quick-${Date.now()}`;
        await conn.query(
          `INSERT INTO bookings (learner_id, trainer_id, session_date, start_time, duration_minutes, status, package_type, amount, meeting_link) 
           VALUES (?, ?, CURDATE(), CURTIME(), 15, 'accepted', 'hourly', ?, ?)`,
          [learnerId, trainerId, amount || 50, meetingLink]
        );
        await conn.commit();
        return;
      }

      // மத்த பேக்கேஜ்களுக்கு (Hourly, Daily) ஸ்லாட் செக் பண்ணும்
      const [slot] = await conn.query(
        'SELECT * FROM availability WHERE id = ? AND trainer_id = ? AND is_booked = 0 FOR UPDATE',
        [availabilityId, trainerId]
      );
      if (!slot.length) throw new Error('Slot is no longer available');

      const s = slot[0];

      await conn.query('UPDATE availability SET is_booked = 1 WHERE id = ?', [availabilityId]);

      await conn.query(
        `INSERT INTO bookings (learner_id, trainer_id, session_date, start_time, status, package_type, amount) 
         VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
        [learnerId, trainerId, s.date, s.start_time, packageType, amount]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },
  
  getLearnerBookings: async (learnerId) => {
    const [rows] = await pool.query(`
      SELECT b.*, u.name AS trainer_name, s.name AS skill_name
      FROM bookings b
      JOIN trainer_profiles tp ON tp.id = b.trainer_id
      JOIN users u ON u.id = tp.user_id
      LEFT JOIN skills s ON s.id = b.skill_id
      WHERE b.learner_id = ? ORDER BY b.session_date DESC
    `, [learnerId]);
    return rows;
  },
  
  getTrainerBookings: async (trainerId) => {
    const [rows] = await pool.query(`
      SELECT b.*, u.name AS learner_name
      FROM bookings b
      JOIN users u ON u.id = b.learner_id
      WHERE b.trainer_id = ? ORDER BY b.session_date DESC
    `, [trainerId]);
    return rows;
  },
  
  updateStatus: async (bookingId, trainerId, status) => {
    if (status === 'accepted') {
      const meetingLink = `https://meet.jit.si/JustLearn-Class-${bookingId}`;
      await pool.query(
        'UPDATE bookings SET status = ?, meeting_link = ? WHERE id = ? AND trainer_id = ?', 
        [status, meetingLink, bookingId, trainerId]
      );
    } else {
      await pool.query('UPDATE bookings SET status = ? WHERE id = ? AND trainer_id = ?', [status, bookingId, trainerId]);
      
      if (status === 'rejected') {
        const [booking] = await pool.query('SELECT session_date, start_time FROM bookings WHERE id = ?', [bookingId]);
        if (booking.length) {
          await pool.query('UPDATE availability SET is_booked = 0 WHERE trainer_id = ? AND date = ? AND start_time = ?',
            [trainerId, booking[0].session_date, booking[0].start_time]);
        }
      }
    }
  },

  getEarnings: async (trainerId) => {
    const [rows] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS total_earned,
        SUM(CASE WHEN status = 'accepted' THEN amount ELSE 0 END) AS pending_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_sessions
      FROM bookings WHERE trainer_id = ?
    `, [trainerId]);
    return rows[0];
  }
};