import { z } from 'zod';

export const createStyleSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    image: z.string({ required_error: 'Image is required' }),
    basePrice: z.number({ required_error: 'Base price is required' }),
    description: z.string().optional(),
    category: z.enum(['Shirt', 'Trouser', 'Suit', 'Other']).optional(),
  }),
});

export const updateStyleSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    image: z.string().optional(),
    basePrice: z.number().optional(),
    description: z.string().optional(),
    category: z.enum(['Shirt', 'Trouser', 'Suit', 'Other']).optional(),
  }),
});
