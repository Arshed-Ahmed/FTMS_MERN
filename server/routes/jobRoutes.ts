import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getTrashedJobs,
  restoreJob,
  forceDeleteJob,
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createJobSchema, updateJobSchema } from '../schemas/jobSchema.js';

const router = express.Router();

router.get('/trash', protect, getTrashedJobs);
router.put('/:id/restore', protect, restoreJob);
router.delete('/:id/force', protect, forceDeleteJob);

router.route('/').get(protect, getJobs).post(protect, validate(createJobSchema), createJob);
router.route('/:id').get(protect, getJobById).put(protect, validate(updateJobSchema), updateJob).delete(protect, deleteJob);

export default router;
