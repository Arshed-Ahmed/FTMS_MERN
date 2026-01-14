import express from 'express';
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getTrashedMaterials,
  restoreMaterial,
  forceDeleteMaterial,
  adjustStock,
  getStockMovements,
} from '../controllers/materialController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createMaterialSchema, updateMaterialSchema } from '../schemas/materialSchema.js';

const router = express.Router();

router.get('/trash', protect, getTrashedMaterials);
router.put('/:id/restore', protect, restoreMaterial);
router.delete('/:id/force', protect, forceDeleteMaterial);

router.post('/:id/adjust', protect, adjustStock);
router.get('/:id/movements', protect, getStockMovements);

router.route('/')
  .get(protect, getMaterials)
  .post(protect, validate(createMaterialSchema), createMaterial);

router
  .route('/:id')
  .get(protect, getMaterialById)
  .put(protect, validate(updateMaterialSchema), updateMaterial)
  .delete(protect, deleteMaterial);

export default router;
