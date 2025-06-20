const express = require('express');
const { claimRaffleTicket, getRaffleTicketCount } = require('../controllers/raffleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get raffle ticket count
router.get('/tickets/:userId', authMiddleware, getRaffleTicketCount);

// Route to claim a raffle ticket
router.post('/claim', authMiddleware, claimRaffleTicket);

module.exports = router;