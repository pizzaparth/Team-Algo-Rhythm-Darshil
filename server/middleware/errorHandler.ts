/**
 * server/middleware/errorHandler.ts
 * Central error handler middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('[API Error]', { path: req.path, code: err.code, message: err.message, stack: err.stack });
    } else {
      logger.warn('[API Warn]', { path: req.path, code: err.code, message: err.message });
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.statusCode === 400 && (err as any).errors ? { errors: (err as any).errors } : {}),
      },
    });
    return;
  }

  // Unexpected error
  logger.error('[Unhandled Error]', { path: req.path, message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
}
