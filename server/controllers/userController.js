const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get user profile and credits
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log('Fetching user profile for userId:', userId);
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('User profile found:', {
            id: user._id,
            email: user.email,
            creditBalance: user.creditBalance
        });
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update user credits (Express middleware version)
exports.updateUserCredits = async (req, res) => {
    try {
        const { userId, credits } = req.body;
        if (!userId || typeof credits !== 'number') {
            return res.status(400).json({ message: 'Invalid input' });
        }
        await User.findByIdAndUpdate(userId, { $inc: { creditBalance: credits } });
        res.json({ message: 'Credits updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user credits', error });
    }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.params.id;
        const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(10);
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};