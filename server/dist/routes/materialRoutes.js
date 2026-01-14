import express from 'express';
import { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, getTrashedMaterials, restoreMaterial, forceDeleteMaterial, adjustStock, getStockMovements, } from '../controllers/materialController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/trash', protect, getTrashedMaterials);
router.put('/:id/restore', protect, restoreMaterial);
router.delete('/:id/force', protect, forceDeleteMaterial);
router.post('/:id/adjust', protect, adjustStock);
router.get('/:id/movements', protect, getStockMovements);
router.route('/').get(protect, getMaterials).post(protect, createMaterial);
router
    .route('/:id')
    .get(protect, getMaterialById)
    .put(protect, updateMaterial)
    .delete(protect, deleteMaterial);
export default router;
