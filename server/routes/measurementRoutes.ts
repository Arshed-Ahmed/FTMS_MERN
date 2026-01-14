import express from 'express';
import {
  getMeasurements,
  getMeasurementById,
  getMeasurementsByCustomer,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getTrashedMeasurements,
  restoreMeasurement,
  forceDeleteMeasurement,
} from '../controllers/measurementController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createMeasurementSchema, updateMeasurementSchema } from '../schemas/measurementSchema.js';

const router = express.Router();

router.get('/trash', protect, getTrashedMeasurements);
router.put('/:id/restore', protect, restoreMeasurement);
router.delete('/:id/force', protect, forceDeleteMeasurement);

router.route('/')
  .get(protect, getMeasurements)
  .post(protect, validate(createMeasurementSchema), createMeasurement);

router.route('/:id')
  .get(protect, getMeasurementById)
  .put(protect, validate(updateMeasurementSchema), updateMeasurement)
  .delete(protect, deleteMeasurement);

router.route('/customer/:customerId').get(protect, getMeasurementsByCustomer);

export default router;
