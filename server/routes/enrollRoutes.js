const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Mock auto-enrollment endpoint
router.post('/', authMiddleware, (req, res) => {
    const { userId, platform } = req.body;
    
    // Mock enrollment logic - in real app this would integrate with external service
    console.log(`Auto-enrolling user ${userId} on platform ${platform}`);
    
    res.json({ 
        success: true, 
        message: `User enrolled on ${platform} successfully`,
        userId,
        platform 
    });
});

module.exports = router;