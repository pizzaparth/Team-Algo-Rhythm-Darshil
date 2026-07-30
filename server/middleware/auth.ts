/**
 * server/middleware/auth.ts
 * JWT authentication middleware and token utilities.
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN ?? '7d';

export interface JWTPayload {
  sub: string;       // user id
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as any);
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    }
    throw new UnauthorizedError('Invalid token');
  }
}

/**
 * requireAuth middleware — validates Bearer JWT, attaches user to req.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing authorization header'));
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * optionalAuth — attaches user if token present, proceeds anyway.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(authHeader.slice(7));
    } catch { /* ignore */ }
  }
  next();
}
