import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import ApiError from '../utils/apiError';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err: any) {
    const formatted = err.errors?.map((e: any) => e.message).join(', ');
    next(new ApiError(400, formatted || 'Invalid request'));
  }
};
