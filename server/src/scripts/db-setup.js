import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const run = async () => {
  let conn;
  try {
    console.log('⏳ Connecting to MySQL server...');
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await conn.query(`USE \`${process.env.DB_NAME}\`;`);

    console.log('⏳ Creating Tables...');
    const schema = await fs.readFile(path.resolve(__dirname, '../../database/schema.sql'), 'utf8');
    for (const stmt of schema.split(';').map(s => s.trim()).filter(s => s.length > 0)) {
       await conn.query(stmt);
    }

    console.log('⏳ Inserting Seed Data...');
    const seed = await fs.readFile(path.resolve(__dirname, '../../database/seed.sql'), 'utf8');
    for (const stmt of seed.split(';').map(s => s.trim()).filter(s => s.length > 0)) {
       await conn.query(stmt);
    }

    console.log('⏳ Creating Default Admin...');
    const hash = await bcrypt.hash('admin123', 10);
    await conn.query(`INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?,?,?,?)`, ['Admin', 'admin@justlearn.com', hash, 'admin']);

    console.log('✅ Database Setup Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup Failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
};
run();