const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Sequelize, DataTypes } = require('sequelize');

// Define Video model
// Define Video model
const defineVideoModel = (sequelize) => {
  const Video = sequelize.define('Video', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    video_uri: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'video_uri'
    },
    avatar_id: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'avatar_id'
    },
    avatar_name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'avatar_name'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'draft'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    }
  }, {
    tableName: 'videos',
    timestamps: false,
    underscored: true
  });
  
  return Video;
};

// Get all videos for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  console.log('Videos GET request - User ID:', req.userId);
  try {
    const sequelize = req.app.get('sequelize');
    const Video = defineVideoModel(sequelize);
    
    const videos = await Video.findAll({
      where: { user_id: req.userId },
      order: [['id', 'DESC']]
    });
    console.log('Found videos:', videos.length);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get a single video
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');
    const Video = defineVideoModel(sequelize);
    
    const video = await Video.findOne({
      where: { 
        id: req.params.id,
        user_id: req.userId
      }
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Create a new video
router.post('/', authMiddleware, async (req, res) => {
  console.log('Create video request received:', req.body);
  console.log('User ID:', req.userId);
  try {
    const sequelize = req.app.get('sequelize');
    const Video = defineVideoModel(sequelize);
    
    const { title, videoPath, avatarUrl, avatarName, status } = req.body;
    
    const video = await Video.create({
      title,
      video_uri: videoPath,
      avatar_id: avatarUrl,
      avatar_name: avatarName || 'Virtual Influencer',
      status: status || 'draft',
      user_id: req.userId
    });
    
    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// Update a video
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');
    const Video = defineVideoModel(sequelize);
    
    const { title, videoPath, avatarUrl, status } = req.body;
    
    const video = await Video.findOne({
      where: { 
        id: req.params.id,
        user_id: req.userId
      }
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    await video.update({
      title,
      video_uri: videoPath,
      avatar_id: avatarUrl,
      status
    });
    
    res.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete a video
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');
    const Video = defineVideoModel(sequelize);
    
    const video = await Video.findOne({
      where: { 
        id: req.params.id,
        user_id: req.userId
      }
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    await video.destroy();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

module.exports = router;