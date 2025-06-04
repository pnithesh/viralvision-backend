const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DataTypes } = require('sequelize');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, businessName } = req.body;
    
    // Add debugging logs
    console.log('Register request received:', { email, businessName });
    
    // Get sequelize instance and User model
    const sequelize = req.app.get('sequelize');
    const User = require('../models/User')(sequelize);
    
    // Check database connection
    console.log('Database name:', sequelize.config.database);
    console.log('Database user:', sequelize.config.username);
    
    // Test direct query
    try {
      const testQuery = await sequelize.query('SELECT COUNT(*) FROM "Users"');
      console.log('Direct query result:', testQuery);
    } catch (queryError) {
      console.error('Direct query error:', queryError.message);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
      businessName
    });

    // Create token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.businessName
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Add debugging logs
    console.log('Login request received:', { email });

    // Get sequelize instance and User model
    const sequelize = req.app.get('sequelize');
    const User = require('../models/User')(sequelize);

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.businessName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;