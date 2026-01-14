import { z } from 'zod';
import mongoose from 'mongoose';
const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});
export const createCustomerSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        nic: z.string().min(1, 'NIC is required'), // Add regex for NIC if needed
        phone: z.string().min(10, 'Phone number must be at least 10 digits'),
        email: z.string().email('Invalid email address'),
        address: z.string().min(1, 'Address is required'),
    }),
});
export const updateCustomerSchema = z.object({
    params: z.object({
        id: objectId,
    }),
    body: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        nic: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
    }),
});
