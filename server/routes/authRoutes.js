const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /auth/login
// @desc    Login user and return JWT
// @access  Public
router.post('/login', login);

// @route   GET /auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, getMe);

module.exports = router;