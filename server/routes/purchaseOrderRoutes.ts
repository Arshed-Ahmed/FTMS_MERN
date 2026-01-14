import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  payPurchaseOrder,
  deletePurchaseOrder,
  getTrashedPurchaseOrders,
  restorePurchaseOrder,
  forceDeletePurchaseOrder,
} from '../controllers/purchaseOrderController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createPurchaseOrderSchema, updatePurchaseOrderSchema } from '../schemas/purchaseOrderSchema.js';

const router = express.Router();

router.route('/trash').get(protect, getTrashedPurchaseOrders);

router.route('/')
  .get(protect, getPurchaseOrders)
  .post(protect, validate(createPurchaseOrderSchema), createPurchaseOrder);

router.route('/:id')
  .get(protect, getPurchaseOrderById)
  .delete(protect, deletePurchaseOrder);

router.route('/:id/status').put(protect, validate(updatePurchaseOrderSchema), updatePurchaseOrderStatus);
router.route('/:id/pay').put(protect, payPurchaseOrder);
router.route('/:id/restore').put(protect, restorePurchaseOrder);
router.route('/:id/force').delete(protect, forceDeletePurchaseOrder);

export default router;
