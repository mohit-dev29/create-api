import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';

export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = (err instanceof ApiError && err.statusCode) || 500;
  const message = err.message || 'Internal Server Error';

  console.error('💥 Error:', err);

  res.status(status).json({
    success: false,
    message,
  });
};
