// server/src/models/Message.js
import pool from '../config/db.js';

export const Message = {
  send: async (senderId, receiverId, message) => {
    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message, is_read) VALUES (?, ?, ?, 0)',
      [senderId, receiverId, message]
    );
  },
  
  getChat: async (user1, user2) => {
    // 1. நாம யாரோட சாட் ஓபன் பண்றோமோ, அவங்க அனுப்பின மெசேஜ்ஸ் எல்லாத்தையும் 'Read' ஆக்கிடணும்
    await pool.query(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?',
      [user2, user1]
    );

    // 2. அப்புறம் சாட் ஹிஸ்டரியை எடுக்கணும்
    const [rows] = await pool.query(`
      SELECT m.*, u.name AS sender_name 
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [user1, user2, user2, user1]);
    return rows;
  },

  getConversations: async (userId) => {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.role 
      FROM users u
      WHERE u.id IN (
        SELECT sender_id FROM messages WHERE receiver_id = ?
        UNION
        SELECT receiver_id FROM messages WHERE sender_id = ?
      )
    `, [userId, userId]);
    return rows;
  },

  // படிக்காத மெசேஜ் எத்தனை இருக்குனு கணக்கிடுவது
  getUnreadCount: async (userId) => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [userId]
    );
    return rows[0].count;
  }
};