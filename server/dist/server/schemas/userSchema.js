import { z } from 'zod';
import mongoose from 'mongoose';
const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});
export const registerUserSchema = z.object({
    body: z.object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        role: z.enum(['Admin', 'Manager', 'Tailor', 'Sales']).optional(),
        phone: z.string().optional(),
    }),
});
export const loginUserSchema = z.object({
    body: z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
    }),
});
export const updateUserProfileSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        phone: z.string().optional(),
    }),
});
export const updateUserSchema = z.object({
    params: z.object({
        id: objectId,
    }),
    body: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(['Admin', 'Manager', 'Tailor', 'Sales']).optional(),
        phone: z.string().optional(),
    }),
});
