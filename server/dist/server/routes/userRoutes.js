import express from 'express';
import { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, getUserById, updateUser, deleteUser, forgotPassword, resetPassword, getTrashedUsers, restoreUser, forceDeleteUser, } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
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
router.route('/trash').get(protect, authorize('Admin'), getTrashedUsers);
router.route('/').post(validate(registerUserSchema), registerUser).get(protect, authorize('Admin'), getUsers);
router.post('/auth', validate(loginUserSchema), authUser);
router.post('/logout', logoutUser);
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validate(updateUserProfileSchema), updateUserProfile);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router
    .route('/:id')
    .get(protect, authorize('Admin'), getUserById)
    .put(protect, authorize('Admin'), validate(updateUserSchema), updateUser)
    .delete(protect, authorize('Admin'), deleteUser);
router.route('/:id/restore').put(protect, authorize('Admin'), restoreUser);
router.route('/:id/force').delete(protect, authorize('Admin'), forceDeleteUser);
export default router;
