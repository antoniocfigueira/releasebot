import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function testConnection() {
  try {
    await query('SELECT 1');
    return { connected: true, name: process.env.DB_NAME };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}
