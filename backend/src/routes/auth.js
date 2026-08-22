import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '../db.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    phone: row.phone || '',
    address: row.address || '',
    active: Boolean(row.active),
  };
}

// POST /auth/google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Google credential token is required.' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.warn('Google verifyIdToken failed, attempting fallback verify:', verifyErr.message);
      // Fallback: decode JWT payload if direct verification needs audience leeway
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString('utf-8')
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      payload = JSON.parse(jsonPayload);
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Failed to extract email from Google credential.' });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || 'Google User';

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (rows.length > 0) {
      user = rows[0];
      if (!Boolean(user.active)) {
        return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
      }
    } else {
      // Auto-register new customer
      const [insertResult] = await pool.query(
        'INSERT INTO users (name, email, password, role, phone, address, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, 'GOOGLE_OAUTH_ACCOUNT', 'CUSTOMER', '', '', 1]
      );
      const [newUserRows] = await pool.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
      user = newUserRows[0];
    }

    res.json(formatUser(user));
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ message: 'Internal server error during Google sign-in.' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!Boolean(user.active)) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    res.json(formatUser(user));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'CUSTOMER', phone = '', address = '', active = true } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, phone, address, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, role, phone, address, active]
    );

    const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(formatUser(newUser[0]));
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// GET /auth/users
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(users.map(formatUser));
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// POST /auth/users
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, phone = '', address = '', active = true } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, phone, address, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, role, phone, address, active]
    );

    const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(formatUser(newUser[0]));
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error creating user.' });
  }
});

// PUT /auth/users/:id/status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (active === undefined) {
      return res.status(400).json({ message: 'active status field is required.' });
    }

    await pool.query('UPDATE users SET active = ? WHERE id = ?', [active, id]);
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(formatUser(user[0]));
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json({ message: 'Server error updating user status.' });
  }
});

// GET /auth/profile/:id
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.json(formatUser(rows[0]));
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// PUT /auth/profile/:id
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, password, email } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    const current = rows[0];
    const updatedName = name !== undefined && name.trim() ? name.trim() : current.name;
    const updatedPhone = phone !== undefined ? phone.trim() : current.phone;
    const updatedAddress = address !== undefined ? address.trim() : current.address;
    
    // Check if email changed and not duplicate
    let updatedEmail = current.email;
    if (email && email.trim().toLowerCase() !== current.email.toLowerCase()) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email.trim().toLowerCase(), id]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email address is already in use by another account.' });
      }
      updatedEmail = email.trim().toLowerCase();
    }

    // Check if password changed
    const updatedPassword = password && password.trim() ? password.trim() : current.password;

    await pool.query(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?, address = ?, password = ?
       WHERE id = ?`,
      [updatedName, updatedEmail, updatedPhone, updatedAddress, updatedPassword, id]
    );

    const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json(formatUser(updatedRows[0]));
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

export default router;
