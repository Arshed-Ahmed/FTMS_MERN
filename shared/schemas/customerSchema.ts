import { z } from 'zod';

// Regex for MongoDB ObjectId (24 hex characters)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z.string().regex(objectIdRegex, {
  message: 'Invalid ObjectId',
});

export const createCustomerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    nic: z.string().min(1, 'NIC is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Invalid email address'),
    address: z.string().min(1, 'Address is required'),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    nic: z.string().min(1, 'NIC is required').optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
    email: z.string().email('Invalid email address').optional(),
    address: z.string().min(1, 'Address is required').optional(),
  }),
});
