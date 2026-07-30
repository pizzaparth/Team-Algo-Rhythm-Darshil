/**
 * server/middleware/validate.ts
 * Request validation middleware using express-validator.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

export function validate(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map(e => ({
      field: (e as any).path ?? (e as any).param ?? 'unknown',
      message: e.msg,
    }));
    return next(new ValidationError('Validation failed', errors));
  }
  next();
}
