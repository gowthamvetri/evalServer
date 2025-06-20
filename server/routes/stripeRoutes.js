const express = require('express');
const { createCheckoutSession, webhook, testAddCredits, checkSessionStatus } = require('../controllers/stripeController');
const router = express.Router();

// Create a Stripe Checkout session
router.post('/checkout', createCheckoutSession);
 
// Webhook to handle Stripe events
router.post('/webhook', webhook);

// Check session status and add credits if payment successful
router.post('/check-session', checkSessionStatus);

// Test endpoint to manually add credits (for development)
router.post('/test-add-credits', testAddCredits);

module.exports = router;