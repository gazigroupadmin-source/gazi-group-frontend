require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Render PostgreSQL Connection Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Render par connection ke liye ye zaroori hai
  }
});

// Database Connection Test aur Table Automatic Create Karna
const initDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Render PostgreSQL Database Connected Successfully!');

    // Agar users table nahi bani toh automatic ban jayegi
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    console.log('📁 Users Table is Ready!');
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
  }
};
initDB();

// 🚀 ROUTE: User Registration (Signup)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Simple Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // 1. Check karo user pehle se register toh nahi hai
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Password ko Secure (Hash) karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Database mein Naya User Insert karo
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    // Response send karo
    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
