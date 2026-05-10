const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { signToken } = require('../utils/token');

const SALT_ROUNDS = 12;

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at
  };
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const [users] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    const user = users[0];
    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: toSafeUser(user),
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: toSafeUser(user),
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
}

module.exports = {
  register,
  login
};
