import express from 'express';
import { emptyTrash } from '../controllers/trashController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();
router.delete('/', protect, admin, emptyTrash);
export default router;
