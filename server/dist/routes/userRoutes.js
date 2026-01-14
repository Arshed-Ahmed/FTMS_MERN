import express from 'express';
import { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, getUserById, updateUser, deleteUser, } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import validate from '../middleware/validateResource.js';
import { registerUserSchema, loginUserSchema, updateUserProfileSchema, updateUserSchema } from '../schemas/userSchema.js';
const router = express.Router();
router.post('/upload', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
        return;
    }
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});
router.route('/').post(validate(registerUserSchema), registerUser).get(protect, admin, getUsers);
router.post('/auth', validate(loginUserSchema), authUser);
router.post('/logout', logoutUser);
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validate(updateUserProfileSchema), updateUserProfile);
router
    .route('/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, validate(updateUserSchema), updateUser)
    .delete(protect, admin, deleteUser);
export default router;
