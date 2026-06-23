import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export { AppError };

interface ErrorResponse {
  status: string;
  statusCode: number;
  message: string;
  stack?: string;
}

export function errorHandler(
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = (err as AppError).statusCode || 500;
  const isOperational = (err as AppError).isOperational || false;
  const message = isOperational ? err.message : 'Internal server error';

  const response: ErrorResponse = {
    status: 'error',
    statusCode,
    message
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
