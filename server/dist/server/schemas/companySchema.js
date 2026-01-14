import { z } from 'zod';
export const createCompanySchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Company name is required' }),
        address: z.string().optional(),
        city: z.string().optional(),
        regNo: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email('Invalid email address').optional().or(z.literal('')),
        website: z.string().url('Invalid URL').optional().or(z.literal('')),
        budget: z.number().optional(),
        targetEmployees: z.number().optional(),
        targetOrders: z.number().optional(),
        logo: z.string().optional(),
    }),
});
export const updateCompanySchema = z.object({
    body: z.object({
        name: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        regNo: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email('Invalid email address').optional().or(z.literal('')),
        website: z.string().url('Invalid URL').optional().or(z.literal('')),
        budget: z.number().optional(),
        targetEmployees: z.number().optional(),
        targetOrders: z.number().optional(),
        logo: z.string().optional(),
    }),
});
