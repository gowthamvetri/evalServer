const express = require('express');
const { getUserProfile, updateUserCredits, getTransactionHistory } = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', authenticate, getUserProfile);
router.post('/credits', authenticate, updateUserCredits);
router.get('/:id/transactions', authenticate, getTransactionHistory);

module.exports = router;