import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { softDeletePlugin } from './plugins/softDelete.js';
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: false, // Optional for now
    },
    email: {
        type: String,
        // required: true, // Optional for now to avoid breaking existing users
        unique: true,
        sparse: true, // Allows null/undefined to be non-unique
    },
    phone: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Manager', 'Tailor', 'Sales'],
        default: 'Tailor',
    },
    status: {
        type: String,
        enum: ['Active', 'Disable'],
        default: 'Active',
    },
    lastLogin: {
        type: Date,
    },
    image: {
        type: String,
    },
    avatar: {
        type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true,
});
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
userSchema.plugin(softDeletePlugin);
const User = mongoose.model('User', userSchema);
export default User;
