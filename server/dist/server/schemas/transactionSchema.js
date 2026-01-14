import { z } from 'zod';
export const createTransactionSchema = z.object({
    body: z.object({
        type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Type is required' }),
        category: z.string({ required_error: 'Category is required' }),
        amount: z.number({ required_error: 'Amount is required' }),
        reference: z.string().optional(),
        description: z.string().optional(),
        paymentMethod: z.enum(['Cash', 'Card', 'Bank Transfer', 'Check', 'Other']).optional(),
        date: z.string().or(z.date()).optional(),
    }),
});
export const updateTransactionSchema = z.object({
    body: z.object({
        type: z.enum(['INCOME', 'EXPENSE']).optional(),
        category: z.string().optional(),
        amount: z.number().optional(),
        reference: z.string().optional(),
        description: z.string().optional(),
        paymentMethod: z.enum(['Cash', 'Card', 'Bank Transfer', 'Check', 'Other']).optional(),
        date: z.string().or(z.date()).optional(),
    }),
});
