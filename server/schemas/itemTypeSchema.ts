import { z } from 'zod';

export const createItemTypeSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    fields: z.array(z.string(), { required_error: 'Fields are required' }),
    image: z.string().optional(),
  }),
});

export const updateItemTypeSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    fields: z.array(z.string()).optional(),
    image: z.string().optional(),
  }),
});
