/**
 * server/routes/sessions.ts
 * AI session persistence routes.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { sessionService } from '../services/sessionService.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ValidationError } from '../utils/errors.js';

const router = Router();
router.use(requireAuth);

// GET /api/v1/sessions?projectId=xxx  — get or create session for project
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, domain } = req.query as Record<string, string>;
    if (!projectId) throw new ValidationError('projectId required');
    const session = sessionService.getOrCreate(projectId, req.user!.sub, domain);
    res.json({ success: true, data: { session } });
  } catch (err) { next(err); }
});

// GET /api/v1/sessions/project/:projectId  — list all sessions for project
router.get('/project/:projectId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = sessionService.listByProject(req.params.projectId, req.user!.sub);
    res.json({ success: true, data: { sessions } });
  } catch (err) { next(err); }
});

// GET /api/v1/sessions/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = sessionService.getById(req.params.id, req.user!.sub);
    res.json({ success: true, data: { session } });
  } catch (err) { next(err); }
});

// PUT /api/v1/sessions/:id  — save session state
router.put(
  '/:id',
  [body('conversation').optional().isArray()],
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = sessionService.save(req.params.id, req.user!.sub, req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/sessions/:id
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    sessionService.delete(req.params.id, req.user!.sub);
    res.json({ success: true, data: { message: 'Session deleted' } });
  } catch (err) { next(err); }
});

export default router;
