const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const dotenv = require('dotenv');
const videoRoutes = require('./routes/videos');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'viralvision',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

// Load models
const User = require('./models/User')(sequelize);

// Test database connection WITHOUT sync
sequelize.authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    console.log('Using existing database tables');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Make sequelize available globally
app.set('sequelize', sequelize);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', videoRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ViralVision Backend API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { sequelize };