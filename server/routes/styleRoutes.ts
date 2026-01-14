import express, { Request, Response } from 'express';
import path from 'path';
import {
  getStyles,
  createStyle,
  getStyleById,
  updateStyle,
  deleteStyle,
  getTrashedStyles,
  restoreStyle,
  forceDeleteStyle,
} from '../controllers/styleController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createStyleSchema, updateStyleSchema } from '../schemas/styleSchema.js';

const router = express.Router();

router.get('/trash', protect, getTrashedStyles);
router.put('/:id/restore', protect, restoreStyle);
router.delete('/:id/force', protect, forceDeleteStyle);

router.route('/')
  .get(getStyles)
  .post(protect, validate(createStyleSchema), createStyle);

router
  .route('/:id')
  .get(protect, getStyleById)
  .put(protect, validate(updateStyleSchema), updateStyle)
  .delete(protect, deleteStyle);

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

router.post('/upload', protect, upload.single('image'), (req: MulterRequest, res: Response) => {
  if (!req.file) {
    res.status(400).send('No file uploaded');
    return;
  }
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

export default router;
