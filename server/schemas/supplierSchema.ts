import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    contactPerson: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    paymentTerms: z.string().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    contactPerson: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    paymentTerms: z.string().optional(),
  }),
});
