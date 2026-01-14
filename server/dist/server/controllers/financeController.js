import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';
import { logAudit } from '../services/auditService.js';
// @desc    Get all transactions
// @route   GET /api/finance/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ isDeleted: false })
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
    await logAudit({
        req,
        action: 'CREATE_TRANSACTION',
        entity: 'Transaction',
        entityId: createdTransaction._id,
        details: { type, category, amount },
    });
    res.status(201).json(createdTransaction);
});
// @desc    Get financial summary (P&L)
// @route   GET /api/finance/summary
// @access  Private
const getFinancialSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    let dateFilter = { isDeleted: false };
    if (startDate && endDate) {
        dateFilter = {
            ...dateFilter,
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
// @desc    Delete transaction
// @route   DELETE /api/finance/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction) {
        await transaction.softDelete();
        await logAudit({
            req,
            action: 'DELETE_TRANSACTION',
            entity: 'Transaction',
            entityId: transaction._id,
        });
        res.json({ message: 'Transaction removed' });
    }
    else {
        res.status(404);
        throw new Error('Transaction not found');
    }
});
// @desc    Get trashed transactions
// @route   GET /api/finance/transactions/trash
// @access  Private
const getTrashedTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ isDeleted: true })
        .populate('recordedBy', 'username')
        .sort({ updatedAt: -1 });
    res.json(transactions);
});
// @desc    Restore transaction
// @route   PUT /api/finance/transactions/:id/restore
// @access  Private
const restoreTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction) {
        await transaction.restore();
        await logAudit({
            req,
            action: 'RESTORE_TRANSACTION',
            entity: 'Transaction',
            entityId: transaction._id,
        });
        res.json({ message: 'Transaction restored' });
    }
    else {
        res.status(404);
        throw new Error('Transaction not found');
    }
});
// @desc    Force delete transaction
// @route   DELETE /api/finance/transactions/:id/force
// @access  Private
const forceDeleteTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction) {
        await transaction.deleteOne();
        await logAudit({
            req,
            action: 'FORCE_DELETE_TRANSACTION',
            entity: 'Transaction',
            entityId: transaction._id,
        });
        res.json({ message: 'Transaction permanently deleted' });
    }
    else {
        res.status(404);
        throw new Error('Transaction not found');
    }
});
export { getTransactions, createTransaction, getFinancialSummary, deleteTransaction, getTrashedTransactions, restoreTransaction, forceDeleteTransaction, };
