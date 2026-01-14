import { z } from 'zod';
export const createEmployeeSchema = z.object({
    body: z.object({
        firstName: z.string({ required_error: 'First name is required' }),
        lastName: z.string({ required_error: 'Last name is required' }),
        nic: z.string({ required_error: 'NIC is required' }),
        address: z.string({ required_error: 'Address is required' }),
        phone: z.string({ required_error: 'Phone is required' }),
        email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
        category: z.string({ required_error: 'Category is required' }),
        startDate: z.string({ required_error: 'Start date is required' }).or(z.date()), // Accept string from JSON
        salary: z.number({ required_error: 'Salary is required' }),
        status: z.string().optional(),
    }),
});
export const updateEmployeeSchema = z.object({
    body: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        nic: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email('Invalid email address').optional(),
        category: z.string().optional(),
        startDate: z.string().or(z.date()).optional(),
        salary: z.number().optional(),
        status: z.string().optional(),
    }),
});
