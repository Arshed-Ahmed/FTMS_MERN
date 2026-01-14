import mongoose from 'mongoose';
const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['INCOME', 'EXPENSE'],
        required: true,
    },
    category: {
        type: String,
        required: true,
        // Examples: 'Sales', 'Procurement', 'Rent', 'Utilities', 'Salary', 'Other'
    },
    amount: {
        type: Number,
        required: true,
    },
    reference: {
        type: String, // Order ID, PO ID, or Invoice #
    },
    description: {
        type: String,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Bank Transfer', 'Check', 'Other'],
        default: 'Cash',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
export default mongoose.model('Transaction', transactionSchema);
