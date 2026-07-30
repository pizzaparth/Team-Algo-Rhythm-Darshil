/**
 * server/routes/search.ts
 * Full-text search across projects, nodes, sessions.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { query } from 'express-validator';
import { searchService } from '../services/searchService.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(requireAuth);

// GET /api/v1/search?q=...&type=...&projectId=...
router.get(
  '/',
  [
    query('q').isLength({ min: 1, max: 200 }).trim(),
    query('type').optional().isIn(['project', 'node', 'note', 'conversation', 'bookmark']),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = searchService.search(req.user!.sub, req.query.q as string, {
        type: req.query.type as string,
        projectId: req.query.projectId as string,
        limit: Number(req.query.limit) || 20,
      });
      res.json({ success: true, data: { results, query: req.query.q } });
    } catch (err) { next(err); }
  }
);

export default router;
