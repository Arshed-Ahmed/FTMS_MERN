import express from 'express';
import { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, getTrashedSuppliers, restoreSupplier, forceDeleteSupplier, } from '../controllers/supplierController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createSupplierSchema, updateSupplierSchema } from '../schemas/supplierSchema.js';
const router = express.Router();
router.route('/trash').get(protect, getTrashedSuppliers);
router.route('/')
    .get(protect, getSuppliers)
    .post(protect, validate(createSupplierSchema), createSupplier);
router
    .route('/:id')
    .get(protect, getSupplierById)
    .put(protect, validate(updateSupplierSchema), updateSupplier)
    .delete(protect, deleteSupplier);
router.route('/:id/restore').put(protect, restoreSupplier);
router.route('/:id/force').delete(protect, forceDeleteSupplier);
export default router;
