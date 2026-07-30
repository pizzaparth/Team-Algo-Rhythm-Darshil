/**
 * server/routes/projects.ts
 * Project CRUD, graph persistence, version history routes.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { projectService } from '../services/projectService.js';
import { exportService } from '../services/exportService.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(requireAuth);

// ===================== PROJECT CRUD =====================

// GET /api/v1/projects
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = projectService.list(req.user!.sub, {
      status: req.query.status as string,
      search: req.query.search as string,
      limit: Number(req.query.limit) || 20,
      offset: Number(req.query.offset) || 0,
      sort: req.query.sort as string,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// GET /api/v1/projects/recent
router.get('/recent', (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = projectService.recent(req.user!.sub, Number(req.query.limit) || 5);
    res.json({ success: true, data: { projects } });
  } catch (err) { next(err); }
});

// GET /api/v1/projects/favourites
router.get('/favourites', (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = projectService.favourites(req.user!.sub);
    res.json({ success: true, data: { projects } });
  } catch (err) { next(err); }
});

// GET /api/v1/projects/templates
router.get('/templates', (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = projectService.templates(req.query.category as string);
    res.json({ success: true, data: { templates } });
  } catch (err) { next(err); }
});

// GET /api/v1/projects/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = projectService.getById(req.params.id, req.user!.sub);
    res.json({ success: true, data: { project } });
  } catch (err) { next(err); }
});

// POST /api/v1/projects
router.post(
  '/',
  [
    body('name').isLength({ min: 1, max: 100 }).trim(),
    body('description').optional().isLength({ max: 500 }),
    body('category').optional().isString(),
    body('color').optional().matches(/^#[0-9a-fA-F]{6}$/),
  ],
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = projectService.create(req.user!.sub, req.body);
      res.status(201).json({ success: true, data: { project } });
    } catch (err) { next(err); }
  }
);

// PATCH /api/v1/projects/:id
router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = projectService.update(req.params.id, req.user!.sub, req.body);
    res.json({ success: true, data: { project } });
  } catch (err) { next(err); }
});

// DELETE /api/v1/projects/:id
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    projectService.delete(req.params.id, req.user!.sub);
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (err) { next(err); }
});

// POST /api/v1/projects/:id/archive
router.post('/:id/archive', (req: Request, res: Response, next: NextFunction) => {
  try {
    projectService.archive(req.params.id, req.user!.sub);
    res.json({ success: true, data: { message: 'Project archived' } });
  } catch (err) { next(err); }
});

// POST /api/v1/projects/:id/duplicate
router.post('/:id/duplicate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = projectService.duplicate(req.params.id, req.user!.sub, req.body.name);
    res.status(201).json({ success: true, data: { project } });
  } catch (err) { next(err); }
});

// ===================== GRAPH PERSISTENCE =====================

// GET /api/v1/projects/:id/graph
router.get('/:id/graph', (req: Request, res: Response, next: NextFunction) => {
  try {
    const graph = projectService.loadGraph(
      req.params.id,
      req.user!.sub,
      req.query.snapshotId as string
    );
    res.json({ success: true, data: graph });
  } catch (err) { next(err); }
});

// POST /api/v1/projects/:id/graph
router.post(
  '/:id/graph',
  [
    body('nodes').isArray(),
    body('edges').isArray(),
  ],
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = projectService.saveGraph(req.params.id, req.user!.sub, req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
);

// ===================== VERSION HISTORY =====================

// GET /api/v1/projects/:id/versions
router.get('/:id/versions', (req: Request, res: Response, next: NextFunction) => {
  try {
    const versions = projectService.getVersionHistory(req.params.id, req.user!.sub);
    res.json({ success: true, data: { versions } });
  } catch (err) { next(err); }
});

// POST /api/v1/projects/:id/versions/checkpoint
router.post(
  '/:id/versions/checkpoint',
  [body('label').isLength({ min: 1, max: 100 }).trim()],
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const snapshot = projectService.createCheckpoint(
        req.params.id, req.user!.sub,
        req.body.label, req.body.description
      );
      res.status(201).json({ success: true, data: { snapshot } });
    } catch (err) { next(err); }
  }
);

// POST /api/v1/projects/:id/versions/:snapshotId/restore
router.post('/:id/versions/:snapshotId/restore', (req: Request, res: Response, next: NextFunction) => {
  try {
    const snapshot = projectService.restoreVersion(
      req.params.id, req.user!.sub, req.params.snapshotId
    );
    res.json({ success: true, data: { snapshot, message: 'Version restored as new head' } });
  } catch (err) { next(err); }
});

// ===================== EXPORT =====================

// POST /api/v1/projects/:id/export
router.post('/:id/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format = 'markdown', ...options } = req.body;
    const project = projectService.getById(req.params.id, req.user!.sub);
    const result = await exportService.export(
      req.params.id, req.user!.sub, format,
      { ...options, projectName: project.name }
    );

    // Return content directly for download
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('X-Export-Id', result.exportId);
    res.send(result.content);
  } catch (err) { next(err); }
});

export default router;
