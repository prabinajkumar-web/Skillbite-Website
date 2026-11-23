import pool from '../config/db.js';

export const User = {
  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  create: async (conn, data) => {
    const [result] = await conn.query(
      'INSERT INTO users (name, email, password_hash, role, phone, city) VALUES (?,?,?,?,?,?)',
      [data.name, data.email, data.hash, data.role, data.phone || null, data.city || null]
    );
    return result.insertId;
  }
};