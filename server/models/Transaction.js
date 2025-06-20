const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['credit', 'debit', 'raffle'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    points: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    stripeSessionId: {
        type: String,
        required: false, // Optional since not all transactions are from Stripe
    },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;