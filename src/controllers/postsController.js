import pool from '../db.js';

export async function createPost(req, res) {
  try {

    const userId = req.user.id;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'title and content are required' });
    }

    const [result] = await pool.query('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)', [userId, title, content]);
    const [rows] = await pool.query('SELECT id, user_id, title, content, created_at, updated_at FROM posts WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create post error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getPosts(req, res) {
  try {
    const [rows] = await pool.query('SELECT p.id, p.user_id, u.name as user_name, p.title, p.content, p.created_at, p.updated_at FROM posts p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC');
    return res.json(rows);
  } catch (err) {
    console.error('Get posts error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getPostById(req, res) {
  try {

    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, user_id, title, content, created_at, updated_at FROM posts WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Get post error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updatePost(req, res) {
  try {

    const userId = req.user.id;
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const [rows] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const fields = [];
    const params = [];

    if (title) {
        fields.push('title = ?'); 
        params.push(title);
    }
    
    if (content) {
        fields.push('content = ?'); 
        params.push(content);
    }

    params.push(id);

    await pool.query(`UPDATE posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
    const [updated] = await pool.query('SELECT id, user_id, title, content, created_at, updated_at FROM posts WHERE id = ?', [id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('Update post error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deletePost(req, res) {
  try {

    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query('DELETE FROM posts WHERE id = ?', [id]);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete post error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
