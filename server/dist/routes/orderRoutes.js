import express from 'express';
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getTrashedOrders, restoreOrder, forceDeleteOrder, getPublicOrderTrack, } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createOrderSchema, updateOrderSchema } from '../schemas/orderSchema.js';
const router = express.Router();
router.get('/track/:id', getPublicOrderTrack);
router.get('/trash', protect, getTrashedOrders);
router.put('/:id/restore', protect, restoreOrder);
router.delete('/:id/force', protect, forceDeleteOrder);
router.route('/')
    .get(protect, getOrders)
    .post(protect, validate(createOrderSchema), createOrder);
router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, validate(updateOrderSchema), updateOrder)
    .delete(protect, deleteOrder);
export default router;
