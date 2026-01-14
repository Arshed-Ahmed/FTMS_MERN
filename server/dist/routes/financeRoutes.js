import express from 'express';
import { getTransactions, createTransaction, getFinancialSummary, } from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/summary', protect, getFinancialSummary);
router.route('/transactions').get(protect, getTransactions).post(protect, createTransaction);
export default router;
