const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Initialize Stripe with the secret key from environment
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

exports.createCheckoutSession = async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const stripe = getStripe();
        
        // Convert credits to price (1000 credits = $10, so 1 credit = $0.01)
        const priceInCents = Math.round(amount * 0.01 * 100); // Convert to cents for Stripe
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Credit Top-Up - ${amount} Credits`,
                        description: `Purchase ${amount} credits for Evaltree platform`,
                    },
                    unit_amount: priceInCents,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?canceled=true`,
            metadata: {
                userId: userId,
                credits: amount.toString()
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        console.log('Payment completed for session:', session.id);
        console.log('Session metadata:', session.metadata);

        const userId = session.metadata.userId;
        const creditsAmount = parseInt(session.metadata.credits);

        if (!userId || !creditsAmount) {
            console.error('Missing userId or credits in session metadata');
            return res.status(400).json({ error: 'Invalid session metadata' });
        }

        try {
            // Check if credits have already been added for this specific session
            const existingTransaction = await Transaction.findOne({
                stripeSessionId: session.id,
                type: 'credit'
            });

            if (existingTransaction) {
                console.log('Credits already added for session via webhook:', session.id);
                return res.json({ received: true, alreadyProcessed: true });
            }

            // Update user's credit balance
            const user = await User.findByIdAndUpdate(
                userId, 
                { $inc: { creditBalance: creditsAmount } },
                { new: true }
            );
            
            console.log(`Webhook: Added ${creditsAmount} credits to user ${userId}. New balance: ${user.creditBalance}`);

            // Create transaction record with session ID to prevent duplicates
            await Transaction.create({
                type: 'credit',
                date: new Date(),
                points: creditsAmount,
                userId: userId,
                stripeSessionId: session.id
            });

            console.log('Webhook: Transaction record created successfully');
        } catch (error) {
            console.error('Error updating user credits via webhook:', error);
            return res.status(500).json({ error: 'Failed to update user credits' });
        }
    }

    res.json({ received: true });
};

// Test endpoint to manually add credits (for development/testing)
exports.testAddCredits = async (req, res) => {
    const { userId, credits } = req.body;

    try {
        console.log(`Test: Adding ${credits} credits to user ${userId}`);
        
        // Update user's credit balance
        const user = await User.findByIdAndUpdate(
            userId, 
            { $inc: { creditBalance: credits } },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`Updated user ${userId} credit balance to: ${user.creditBalance}`);

        // Create transaction record
        await Transaction.create({
            type: 'credit',
            date: new Date(),
            points: credits,
            userId: userId
        });

        console.log('Transaction record created successfully');

        res.json({ 
            success: true, 
            newBalance: user.creditBalance,
            creditsAdded: credits
        });
    } catch (error) {
        console.error('Error in test add credits:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Check Stripe session status and add credits if successful
exports.checkSessionStatus = async (req, res) => {
    const { sessionId } = req.body;

    try {
        console.log('Checking Stripe session status for:', sessionId);
        
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        console.log('Session status:', session.payment_status);
        console.log('Session metadata:', session.metadata);

        if (session.payment_status === 'paid') {
            const userId = session.metadata.userId;
            const creditsAmount = parseInt(session.metadata.credits);

            if (!userId || !creditsAmount) {
                return res.status(400).json({ error: 'Invalid session metadata' });
            }

            // Check if credits have already been added for this specific session
            const existingTransaction = await Transaction.findOne({
                stripeSessionId: sessionId,
                type: 'credit'
            });

            if (existingTransaction) {
                console.log('Client check: Credits already added for session:', sessionId);
                const user = await User.findById(userId);
                return res.json({ 
                    success: true, 
                    alreadyProcessed: true,
                    newBalance: user.creditBalance,
                    creditsAdded: creditsAmount
                });
            }

            // Add credits to user
            const user = await User.findByIdAndUpdate(
                userId, 
                { $inc: { creditBalance: creditsAmount } },
                { new: true }
            );

            // Create transaction record with session ID
            await Transaction.create({
                type: 'credit',
                date: new Date(),
                points: creditsAmount,
                userId: userId,
                stripeSessionId: sessionId
            });

            console.log(`Client check: Successfully added ${creditsAmount} credits to user ${userId}. New balance: ${user.creditBalance}`);

            res.json({ 
                success: true, 
                newBalance: user.creditBalance,
                creditsAdded: creditsAmount
            });
        } else {
            res.json({ success: false, status: session.payment_status });
        }
    } catch (error) {
        console.error('Error checking session status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};