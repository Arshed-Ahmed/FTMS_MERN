import { z } from 'zod';

export const createMaterialSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    type: z.enum(['Fabric', 'Button', 'Thread', 'Zipper', 'Lining', 'Other'], { required_error: 'Type is required' }),
    color: z.string().optional(),
    quantity: z.number({ required_error: 'Quantity is required' }),
    unit: z.enum(['Meters', 'Yards', 'Pieces', 'Spools', 'Box'], { required_error: 'Unit is required' }),
    costPerUnit: z.number({ required_error: 'Cost per unit is required' }),
    supplier: z.string().optional(),
    lowStockThreshold: z.number().optional(),
    description: z.string().optional(),
    sku: z.string().optional(),
  }),
});

export const updateMaterialSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.enum(['Fabric', 'Button', 'Thread', 'Zipper', 'Lining', 'Other']).optional(),
    color: z.string().optional(),
    quantity: z.number().optional(),
    unit: z.enum(['Meters', 'Yards', 'Pieces', 'Spools', 'Box']).optional(),
    costPerUnit: z.number().optional(),
    supplier: z.string().optional(),
    lowStockThreshold: z.number().optional(),
    description: z.string().optional(),
    sku: z.string().optional(),
  }),
});
