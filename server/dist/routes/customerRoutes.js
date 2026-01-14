import express from 'express';
import { getCustomers, createCustomer, getCustomerById, updateCustomer, deleteCustomer, getTrashedCustomers, restoreCustomer, forceDeleteCustomer, } from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customerSchema.js';
const router = express.Router();
router.get('/trash', protect, getTrashedCustomers);
router.put('/:id/restore', protect, restoreCustomer);
router.delete('/:id/force', protect, forceDeleteCustomer);
router.route('/').get(protect, getCustomers).post(protect, validate(createCustomerSchema), createCustomer);
router
    .route('/:id')
    .get(protect, getCustomerById)
    .put(protect, validate(updateCustomerSchema), updateCustomer)
    .delete(protect, deleteCustomer);
export default router;
