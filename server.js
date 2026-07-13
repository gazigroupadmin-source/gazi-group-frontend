require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middlewares
app.use(cors());
app.use(express.json());

// 2. Supabase Database Connection Configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Render aur Supabase ke secure connection ke liye zaroori hai
  }
});

// 3. Database Connection Test aur Table Automatic Create Karna
const initDB = async () => {
  try {
    // Database se handshake test kar rahe hain
    await pool.query('SELECT NOW()');
    console.log('✅ Supabase PostgreSQL Connected Successfully!');

    // Agar Supabase par 'users' table nahi bani hogi, toh ye automatic bana dega
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
    console.log('📁 Users Table is Ready on Supabase!');
  } catch (err) {
    console.error('❌ Supabase Connection Error:', err.message);
  }
};
initDB();

// 4. 🚀 ROUTE: User Registration (Signup)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Simple Input Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check karo ki email pehle se register toh nahi hai
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Password ko Secure (Hash) karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Database mein Naya User Insert karo
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    // Success Response send karo frontend ko
    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 5. Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
