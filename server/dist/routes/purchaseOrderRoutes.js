import express from 'express';
import { getPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, updatePurchaseOrderStatus, payPurchaseOrder, } from '../controllers/purchaseOrderController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.route('/').get(protect, getPurchaseOrders).post(protect, createPurchaseOrder);
router.route('/:id').get(protect, getPurchaseOrderById);
router.route('/:id/status').put(protect, updatePurchaseOrderStatus);
router.route('/:id/pay').put(protect, payPurchaseOrder);
export default router;
