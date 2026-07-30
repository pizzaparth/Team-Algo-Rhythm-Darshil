/**
 * server/routes/users.ts
 * User profile and preferences routes.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { userRepository } from '../repositories/userRepository.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);

// GET /api/v1/users/me/preferences
router.get('/me/preferences', (req: Request, res: Response, next: NextFunction) => {
  try {
    const prefs = userRepository.getPreferences(req.user!.sub);
    if (!prefs) throw new NotFoundError('Preferences');
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
      const { theme, defaultDomain, aiVerbosity, autoExpand, graphLayout, exportFormat,
              showEvidence, showExperts, showHistorical, notificationsEnabled } = req.body;

      userRepository.updatePreferences(req.user!.sub, {
        ...(theme !== undefined && { theme }),
        ...(defaultDomain !== undefined && { default_domain: defaultDomain }),
        ...(aiVerbosity !== undefined && { ai_verbosity: aiVerbosity }),
        ...(autoExpand !== undefined && { auto_expand: autoExpand ? 1 : 0 }),
        ...(graphLayout !== undefined && { graph_layout: graphLayout }),
        ...(exportFormat !== undefined && { export_format: exportFormat }),
        ...(showEvidence !== undefined && { show_evidence: showEvidence ? 1 : 0 }),
        ...(showExperts !== undefined && { show_experts: showExperts ? 1 : 0 }),
        ...(showHistorical !== undefined && { show_historical: showHistorical ? 1 : 0 }),
        ...(notificationsEnabled !== undefined && { notifications_enabled: notificationsEnabled ? 1 : 0 }),
      });

      const updated = userRepository.getPreferences(req.user!.sub);
      res.json({ success: true, data: { preferences: updated } });
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
      const { displayName, bio } = req.body;
      userRepository.update(req.user!.sub, {
        ...(displayName !== undefined && { display_name: displayName }),
        ...(bio !== undefined && { bio }),
      });
      const user = userRepository.findById(req.user!.sub);
      res.json({ success: true, data: { user: {
        id: user!.id, email: user!.email, username: user!.username,
        displayName: user!.display_name, avatarUrl: user!.avatar_url, bio: user!.bio,
      } } });
    } catch (err) { next(err); }
  }
);

export default router;
