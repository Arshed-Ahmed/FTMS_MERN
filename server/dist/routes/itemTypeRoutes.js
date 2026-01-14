import express from 'express';
import { getItemTypes, createItemType, getItemTypeById, updateItemType, deleteItemType, getTrashedItemTypes, restoreItemType, forceDeleteItemType, } from '../controllers/itemTypeController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
const router = express.Router();
router.get('/trash', protect, getTrashedItemTypes);
router.put('/:id/restore', protect, restoreItemType);
router.delete('/:id/force', protect, forceDeleteItemType);
router.post('/upload', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
        return;
    }
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});
router.route('/').get(getItemTypes).post(protect, createItemType);
router
    .route('/:id')
    .get(protect, getItemTypeById)
    .put(protect, updateItemType)
    .delete(protect, deleteItemType);
export default router;
