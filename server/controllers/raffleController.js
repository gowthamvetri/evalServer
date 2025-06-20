const RaffleTicket = require('../models/RaffleTicket');
const User = require('../models/User');

// Get raffle ticket count for a user
exports.getRaffleTicketCount = async (req, res) => {
    try {
        const userId = req.params.userId;
        const raffleTickets = await RaffleTicket.find({ userId });
        const totalTickets = raffleTickets.reduce((sum, ticket) => sum + ticket.count, 0);
        
        res.json({ ticketCount: totalTickets });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Claim a raffle ticket
exports.claimRaffleTicket = async (req, res) => {
    const { userId } = req.body;
    const ticketCost = 50; // Credits per ticket

    try {
        // Find the user and update their credits
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has enough credits
        if (user.creditBalance < ticketCost) {
            return res.status(400).json({ message: 'Insufficient credits' });
        }

        // Deduct credits and create raffle ticket
        user.creditBalance -= ticketCost;
        await user.save();

        const raffleTicket = new RaffleTicket({
            userId: user._id,
            count: 1
        });

        await raffleTicket.save();

        res.status(200).json({ 
            message: 'Raffle ticket claimed successfully', 
            credits: user.creditBalance,
            ticketClaimed: true
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};