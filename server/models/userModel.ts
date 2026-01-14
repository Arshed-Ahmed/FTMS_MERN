import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser as ISharedUser } from '../../shared/types.js';
import { softDeletePlugin, SoftDeleteModel, SoftDeleteDocument } from './plugins/softDelete.js';

export interface IUser extends Omit<ISharedUser, '_id'>, SoftDeleteDocument {
  password: string;
  status: 'Active' | 'Disable';
  avatar?: string; // Keep for backward compatibility if needed, or map to image
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
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

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.plugin(softDeletePlugin);

const User = mongoose.model<IUser, SoftDeleteModel<IUser>>('User', userSchema);

export default User;
