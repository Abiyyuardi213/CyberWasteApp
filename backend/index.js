const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'echotech_super_secret_key_12345';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

// Create tables helper
function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready.');
    }
  });
}

// Database helper functions wrapped in Promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Route: Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Simple validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Harap isi semua kolom' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    await dbRun(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username.toLowerCase().trim(), email.toLowerCase().trim(), hashedPassword]
    );

    res.status(201).json({ success: true, message: 'Registrasi berhasil!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Route: Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Harap isi semua kolom' });
    }

    const input = emailOrUsername.toLowerCase().trim();

    // Find user by email or username
    const user = await dbGet('SELECT * FROM users WHERE email = ? OR username = ?', [input, input]);
    if (!user) {
      return res.status(400).json({ error: 'Email atau username tidak terdaftar' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Route: Get Profile (Authenticated Route)
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Akses ditolak. Token tidak disediakan.' });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token tidak valid atau kedaluwarsa' });
      }

      const user = await dbGet('SELECT id, username, email, created_at FROM users WHERE id = ?', [decoded.id]);
      if (!user) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }

      res.json({ success: true, user });
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
