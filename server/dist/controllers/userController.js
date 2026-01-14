import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
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
    const users = await User.find({});
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
        await user.deleteOne();
        res.json({ message: 'User removed' });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
export { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, getUserById, updateUser, deleteUser, };
