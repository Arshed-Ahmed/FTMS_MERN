import { z } from 'zod';
export const createNotificationSchema = z.object({
    body: z.object({
        recipient: z.string({ required_error: 'Recipient ID is required' }),
        title: z.string({ required_error: 'Title is required' }),
        message: z.string({ required_error: 'Message is required' }),
        type: z.enum(['info', 'success', 'warning', 'error', 'order_update', 'inventory_alert']).optional(),
        read: z.boolean().optional(),
        link: z.string().optional(),
    }),
});
export const updateNotificationSchema = z.object({
    body: z.object({
        read: z.boolean().optional(),
    }),
});
