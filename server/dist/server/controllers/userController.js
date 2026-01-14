import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { logAudit } from '../services/auditService.js';
// @desc    Auth user/set token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
        user.lastLogin = new Date();
        await user.save();
        generateToken(res, user._id);
        // Manually construct req object for audit log since user is not yet in req.user
        // Or just pass the user ID directly if we modify logAudit, but let's stick to the pattern
        // We can't use logAudit easily here because it expects req.user. 
        // Let's skip audit for login for now or we'd need to mock the req.user
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
        });
    }
    else {
        res.status(401);
        throw new Error('Invalid username or password');
    }
});
// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, password, role, email, phone, avatar } = req.body;
    const userExists = await User.findOne({ username });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const user = await User.create({
        username,
        password,
        role,
        email,
        phone,
        avatar,
    });
    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
        });
    }
    else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});
// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'User logged out' });
});
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }
    const user = await User.findById(req.user._id);
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.avatar = req.body.avatar || user.avatar;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        await logAudit({
            req,
            action: 'UPDATE_PROFILE',
            entity: 'User',
            entityId: updatedUser._id,
            details: { username: updatedUser.username, email: updatedUser.email },
        });
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            role: updatedUser.role,
            email: updatedUser.email,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ isDeleted: false });
    res.json(users);
});
// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.username = req.body.username || user.username;
        user.role = req.body.role || user.role;
        user.status = req.body.status || user.status;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.avatar = req.body.avatar || user.avatar;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        await logAudit({
            req,
            action: 'UPDATE_USER',
            entity: 'User',
            entityId: updatedUser._id,
            details: { username: updatedUser.username, role: updatedUser.role },
        });
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            role: updatedUser.role,
            status: updatedUser.status,
            email: updatedUser.email,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.softDelete();
        await logAudit({
            req,
            action: 'DELETE_USER',
            entity: 'User',
            entityId: user._id,
        });
        res.json({ message: 'User removed' });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Forgot Password
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        res.status(404);
        throw new Error('User not found with that email');
    }
    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // Set expire
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message,
        });
        res.status(200).json({ success: true, data: 'Email sent' });
    }
    catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('Email could not be sent');
    }
});
// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        res.status(400);
        throw new Error('Invalid token');
    }
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    generateToken(res, user._id);
    res.status(200).json({
        success: true,
        data: 'Password updated success',
    });
});
// @desc    Get trashed users
// @route   GET /api/users/trash
// @access  Private/Admin
const getTrashedUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ isDeleted: true }).sort({ updatedAt: -1 });
    res.json(users);
});
// @desc    Restore user
// @route   PUT /api/users/:id/restore
// @access  Private/Admin
const restoreUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.restore();
        await logAudit({
            req,
            action: 'RESTORE_USER',
            entity: 'User',
            entityId: user._id,
        });
        res.json({ message: 'User restored' });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Force delete user
// @route   DELETE /api/users/:id/force
// @access  Private/Admin
const forceDeleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        await logAudit({
            req,
            action: 'FORCE_DELETE_USER',
            entity: 'User',
            entityId: user._id,
        });
        res.json({ message: 'User permanently deleted' });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
export { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, getUserById, updateUser, deleteUser, forgotPassword, resetPassword, getTrashedUsers, restoreUser, forceDeleteUser, };
