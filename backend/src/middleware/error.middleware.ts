import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

/**
 * Global error handler middleware.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal server error';

  console.error(`[ERROR] ${statusCode} - ${message}`, err.details ?? '');

  // Don't leak stack traces in production
  const response: Record<string, unknown> = {
    error: message,
    statusCode,
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * Helper to create typed errors with status codes.
 */
export function createError(message: string, statusCode: number = 500, details?: unknown): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.details = details;
  return err;
}
