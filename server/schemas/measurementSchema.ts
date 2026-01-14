import { z } from 'zod';

export const createMeasurementSchema = z.object({
  body: z.object({
    customer: z.string({ required_error: 'Customer ID is required' }),
    item: z.string({ required_error: 'Item name is required' }),
    values: z.record(z.string(), z.string()).optional(),
    notes: z.string().optional(),
    moreDetails: z.string().optional(),
  }),
});

export const updateMeasurementSchema = z.object({
  body: z.object({
    customer: z.string().optional(),
    item: z.string().optional(),
    values: z.record(z.string(), z.string()).optional(),
    notes: z.string().optional(),
    moreDetails: z.string().optional(),
  }),
});
