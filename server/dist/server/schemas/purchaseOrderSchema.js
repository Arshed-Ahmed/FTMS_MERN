import { z } from 'zod';
const purchaseOrderItemSchema = z.object({
    material: z.string({ required_error: 'Material ID is required' }),
    quantity: z.number({ required_error: 'Quantity is required' }),
    unitCost: z.number({ required_error: 'Unit cost is required' }),
    total: z.number({ required_error: 'Total is required' }),
});
export const createPurchaseOrderSchema = z.object({
    body: z.object({
        supplier: z.string({ required_error: 'Supplier ID is required' }),
        items: z.array(purchaseOrderItemSchema, { required_error: 'Items are required' }),
        totalAmount: z.number({ required_error: 'Total amount is required' }),
        status: z.enum(['Draft', 'Ordered', 'Received', 'Cancelled']).optional(),
        paymentStatus: z.enum(['Pending', 'Paid']).optional(),
        orderDate: z.string().or(z.date()).optional(),
        expectedDate: z.string().or(z.date()).optional(),
        receivedDate: z.string().or(z.date()).optional(),
        notes: z.string().optional(),
    }),
});
export const updatePurchaseOrderSchema = z.object({
    body: z.object({
        supplier: z.string().optional(),
        items: z.array(purchaseOrderItemSchema).optional(),
        totalAmount: z.number().optional(),
        status: z.enum(['Draft', 'Ordered', 'Received', 'Cancelled']).optional(),
        paymentStatus: z.enum(['Pending', 'Paid']).optional(),
        orderDate: z.string().or(z.date()).optional(),
        expectedDate: z.string().or(z.date()).optional(),
        receivedDate: z.string().or(z.date()).optional(),
        notes: z.string().optional(),
    }),
});
