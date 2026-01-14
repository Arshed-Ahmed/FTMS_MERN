import { z } from 'zod';
import mongoose from 'mongoose';
const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});
export const createJobSchema = z.object({
    body: z.object({
        order: objectId,
        employee: objectId.optional(),
        assignedDate: z.string().datetime().optional(),
        deadline: z.string().datetime().optional(),
        details: z.string().optional(),
        status: z.enum(['Pending', 'In Progress', 'Completed', 'On Hold']).optional(),
    }),
});
export const updateJobSchema = z.object({
    params: z.object({
        id: objectId,
    }),
    body: z.object({
        order: objectId.optional(),
        employee: objectId.optional(),
        assignedDate: z.string().datetime().optional(),
        deadline: z.string().datetime().optional(),
        details: z.string().optional(),
        status: z.enum(['Pending', 'In Progress', 'Completed', 'On Hold']).optional(),
    }),
});
