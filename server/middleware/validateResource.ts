import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e: any) {
    if (e instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: e.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    return res.status(400).send(e.errors);
  }
};

export default validate;
