import express from 'express';
import dotenv from 'dotenv';
import db from './db.js'
import usersRoutes from './routes/users.routes.js';
import postsRoutes from './routes/posts.routes.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.status(200).json({
      status: 'ok',
      database: rows[0].ok === 1
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(500).json({ status: 'error', database: false });
  }
});

app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, async () => {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('Database connected successfully.');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
  console.log(`Server running on port ${PORT}`);
});

