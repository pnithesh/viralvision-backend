const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const authenticateToken = require('../middleware/auth');

// Create a new video project
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');
    const userId = req.user.userId;
    const { title, videoUri, avatarId, avatarName, status = 'draft' } = req.body;

    if (!title || !videoUri || !avatarId || !avatarName) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const [result] = await sequelize.query(
      `INSERT INTO videos (user_id, title, video_uri, avatar_id, avatar_name, status) 
       VALUES (:userId, :title, :videoUri, :avatarId, :avatarName, :status) 
       RETURNING *`,
      {
        replacements: { userId, title, videoUri, avatarId, avatarName, status },
        type: Sequelize.QueryTypes.INSERT
      }
    );

    res.json({ 
      message: 'Video saved successfully', 
      video: result[0] 
    });
  } catch (error) {
    console.error('Save video error:', error);
    res.status(500).json({ 
      error: 'Failed to save video' 
    });
  }
});

// Get all videos for a user
router.get('/my-videos', authenticateToken, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');
    const userId = req.user.userId;
    
    const videos = await sequelize.query(
      'SELECT * FROM videos WHERE user_id = :userId ORDER BY created_at DESC',
      {
        replacements: { userId },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    res.json({ videos });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch videos' 
    });
  }
});

// Get a single video
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');
    const userId = req.user.userId;
    const videoId = req.params.id;
    
    const videos = await sequelize.query(
      'SELECT * FROM videos WHERE id = :videoId AND user_id = :userId',
      {
        replacements: { videoId, userId },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (videos.length === 0) {
      return res.status(404).json({ 
        error: 'Video not found' 
      });
    }

    res.json({ video: videos[0] });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch video' 
    });
  }
});

module.exports = router;