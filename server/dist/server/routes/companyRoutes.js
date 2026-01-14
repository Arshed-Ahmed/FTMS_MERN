import express from 'express';
import { getCompany, updateCompany } from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { updateCompanySchema } from '../schemas/companySchema.js';
const router = express.Router();
router.route('/').get(protect, getCompany).put(protect, validate(updateCompanySchema), updateCompany);
export default router;
