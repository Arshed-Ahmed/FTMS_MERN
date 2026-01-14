import express from 'express';
import {
  getTransactions,
  createTransaction,
  getFinancialSummary,
  deleteTransaction,
  getTrashedTransactions,
  restoreTransaction,
  forceDeleteTransaction,
} from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createTransactionSchema } from '../schemas/transactionSchema.js';

const router = express.Router();

router.get('/summary', protect, getFinancialSummary);
router.get('/transactions/trash', protect, getTrashedTransactions);

router.route('/transactions')
  .get(protect, getTransactions)
  .post(protect, validate(createTransactionSchema), createTransaction);

router.route('/transactions/:id').delete(protect, deleteTransaction);
router.route('/transactions/:id/restore').put(protect, restoreTransaction);
router.route('/transactions/:id/force').delete(protect, forceDeleteTransaction);

export default router;
