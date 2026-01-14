import express from 'express';
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getTrashedOrders, restoreOrder, forceDeleteOrder, getPublicOrderTrack, } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createOrderSchema, updateOrderSchema } from '../schemas/orderSchema.js';
const router = express.Router();
router.get('/track/:id', getPublicOrderTrack);
router.get('/trash', protect, authorize('Admin', 'Manager'), getTrashedOrders);
router.put('/:id/restore', protect, authorize('Admin', 'Manager'), restoreOrder);
router.delete('/:id/force', protect, authorize('Admin'), forceDeleteOrder);
router.route('/')
    .get(protect, getOrders)
    .post(protect, validate(createOrderSchema), createOrder);
router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, validate(updateOrderSchema), updateOrder)
    .delete(protect, authorize('Admin', 'Manager'), deleteOrder);
export default router;
