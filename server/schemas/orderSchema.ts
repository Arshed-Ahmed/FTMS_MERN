import { z } from 'zod';

const materialUsedSchema = z.object({
  material: z.string({ required_error: 'Material ID is required' }),
  quantity: z.number({ required_error: 'Quantity is required' }).min(0.1, 'Quantity must be positive'),
});

export const createOrderSchema = z.object({
  body: z.object({
    customer: z.string({ required_error: 'Customer ID is required' }),
    style: z.string({ required_error: 'Style ID is required' }),
    deliveryDate: z.string({ required_error: 'Delivery Date is required' }).datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // Allow ISO or YYYY-MM-DD
    fitOnDate: z.string().optional(),
    price: z.number({ required_error: 'Price is required' }).min(0, 'Price cannot be negative'),
    discount: z.number().min(0).optional(),
    description: z.string().optional(),
    status: z.enum(['Draft', 'Pending', 'Measured', 'Cutting', 'Stitching', 'Trial', 'Ready', 'Delivered', 'In Progress']).optional(),
    measurementSnapshot: z.record(z.string(), z.string()).optional(),
    materialsUsed: z.array(materialUsedSchema).optional(),
  }),
});

export const updateOrderSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Order ID is required' }),
  }),
  body: z.object({
    customer: z.string().optional(),
    style: z.string().optional(),
    deliveryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    fitOnDate: z.string().optional(),
    price: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    description: z.string().optional(),
    status: z.enum(['Draft', 'Pending', 'Measured', 'Cutting', 'Stitching', 'Trial', 'Ready', 'Delivered', 'In Progress', 'Cancelled']).optional(),
    measurementSnapshot: z.record(z.string(), z.string()).optional(),
    materialsUsed: z.array(materialUsedSchema).optional(),
  }),
});
