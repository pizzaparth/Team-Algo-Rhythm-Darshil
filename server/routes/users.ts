/**
 * server/routes/users.ts
 * User profile and preferences routes.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { userService } from '../services/userService.js';

const router = Router();
router.use(requireAuth);

// GET /api/v1/users/me/preferences
router.get('/me/preferences', (req: Request, res: Response, next: NextFunction) => {
  try {
    const prefs = userService.getPreferences(req.user!.sub);
    res.json({ success: true, data: { preferences: prefs } });
  } catch (err) { next(err); }
});

// PATCH /api/v1/users/me/preferences
router.patch(
  '/me/preferences',
  [
    body('theme').optional().isIn(['dark', 'light', 'system']),
    body('defaultDomain').optional().isIn(['general', 'politics', 'business', 'software']),
    body('aiVerbosity').optional().isIn(['concise', 'balanced', 'detailed']),
    body('autoExpand').optional().isBoolean(),
    body('graphLayout').optional().isIn(['horizontal', 'vertical', 'radial']),
    body('exportFormat').optional().isIn(['markdown', 'json', 'mermaid']),
  ],
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const preferences = userService.updatePreferences(req.user!.sub, req.body);
      res.json({ success: true, data: { preferences } });
    } catch (err) { next(err); }
  }
);

// PATCH /api/v1/users/me  — update profile
router.patch(
  '/me',
  [
    body('displayName').optional().isLength({ min: 1, max: 50 }).trim(),
    body('bio').optional().isLength({ max: 200 }),
  ],
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = userService.updateProfile(req.user!.sub, req.body);
      res.json({ success: true, data: { user } });
    } catch (err) { next(err); }
  }
);

export default router;
