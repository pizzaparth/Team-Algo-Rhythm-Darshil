/**
 * server/routes/auth.ts
 * Authentication routes: register, login, refresh, logout, profile.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_-]+$/),
    body('displayName').isLength({ min: 1, max: 50 }).trim(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
);

// POST /api/v1/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login({
        ...req.body,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  body('refreshToken').notEmpty(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refreshTokens(req.body.refreshToken);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  requireAuth,
  body('refreshToken').notEmpty(),
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      authService.logout(req.body.refreshToken);
      res.json({ success: true, data: { message: 'Logged out' } });
    } catch (err) { next(err); }
  }
);

// POST /api/v1/auth/logout-all
router.post('/logout-all', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    authService.logoutAll(req.user!.sub);
    res.json({ success: true, data: { message: 'All sessions terminated' } });
  } catch (err) { next(err); }
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = authService.getProfile(req.user!.sub);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
});

// PUT /api/v1/auth/password
router.put(
  '/password',
  requireAuth,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.updatePassword(
        req.user!.sub,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.json({ success: true, data: { message: 'Password updated. Please log in again.' } });
    } catch (err) { next(err); }
  }
);

export default router;
