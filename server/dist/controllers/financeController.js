import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';
// @desc    Get all transactions
// @route   GET /api/finance/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({})
        .populate('recordedBy', 'username')
        .sort({ date: -1 });
    res.json(transactions);
});
// @desc    Create a manual transaction (Expense or Income)
// @route   POST /api/finance/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
    const { type, category, amount, reference, description, paymentMethod, date } = req.body;
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }
    const transaction = new Transaction({
        type,
        category,
        amount,
        reference,
        description,
        paymentMethod,
        date: date || Date.now(),
        recordedBy: req.user._id,
    });
    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
});
// @desc    Get financial summary (P&L)
// @route   GET /api/finance/summary
// @access  Private
const getFinancialSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
        dateFilter = {
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        };
    }
    const stats = await Transaction.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
    ]);
    const income = stats.find(s => s._id === 'INCOME')?.total || 0;
    const expense = stats.find(s => s._id === 'EXPENSE')?.total || 0;
    const netProfit = income - expense;
    // Breakdown by category
    const categoryStats = await Transaction.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: { type: '$type', category: '$category' },
                total: { $sum: '$amount' },
            },
        },
        { $sort: { total: -1 } }
    ]);
    res.json({
        income,
        expense,
        netProfit,
        breakdown: categoryStats,
    });
});
export { getTransactions, createTransaction, getFinancialSummary, };
