import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(req, res) {
  try {

    const { name, email, password } = req.body;
    
    if (!name || !email || !password) { 
      return res.status(400).json({ message: 'name, email and password are required' }); 
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existing.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
    const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    return res.status(201).json({ id: result.insertId, name, email, token });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req, res) {
  try {
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const [rows] = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    return res.json({ id: user.id, name: user.name, email: user.email, token });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateProfile(req, res) {
  try {
    
    const userId = req.user.id;
    const { name, password } = req.body;

    if (!name && !password) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const fields = [];
    const params = [];

    if (name) { 
      fields.push('name = ?'); 
      params.push(name); 
    }

    if (password) { 
      const hash = await bcrypt.hash(password, 10); 
      fields.push('password_hash = ?'); 
      params.push(hash); 
    }

    params.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    return res.json(rows[0]);
  } catch (err) {
    console.error('Update profile error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

  export async function getProfile(req, res) {
    try {

      const userId = req.user.id;
      const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);

      if (!rows.length) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(rows[0]);
    } catch (err) {
      console.error('Get profile error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

export async function getUsers(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, name, email FROM users');
    return res.json(rows);
  } catch (err) {
    console.error('Get users error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
