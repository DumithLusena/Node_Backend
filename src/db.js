import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await connection.query(`
    CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
  `);
  console.log(`Database '${process.env.DB_NAME}' checked/created.`);

  await connection.end();

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  const [idxUserId] = await pool.query(`SHOW INDEX FROM posts WHERE Key_name = 'idx_posts_user_id'`);
  if (idxUserId.length === 0) {
    await pool.query(`CREATE INDEX idx_posts_user_id ON posts(user_id)`);
  }
  const [idxCreatedAt] = await pool.query(`SHOW INDEX FROM posts WHERE Key_name = 'idx_posts_created_at'`);
  if (idxCreatedAt.length === 0) {
    await pool.query(`CREATE INDEX idx_posts_created_at ON posts(created_at)`);
  }

  console.log("Tables 'users' and 'posts' checked/created successfully.");

  return pool;
}

const db = await initDB();
export default db;
