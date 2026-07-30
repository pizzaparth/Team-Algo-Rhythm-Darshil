/**
 * server/routes/files.ts
 * File upload and management routes.
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';
import { execute, queryOne, queryAll } from '../database/db.js';
import { uid } from '../utils/id.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../data/uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Allowed MIME types
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown', 'text/plain',
  'application/json',
  'text/csv',
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    cb(null, `${uid()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new ValidationError(`File type '${file.mimetype}' not allowed`) as any);
  },
});

const router = Router();
router.use(requireAuth);

// POST /api/v1/files/upload
router.post('/upload', upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
      return;
    }

    const fileId = uid();
    execute(
      `INSERT INTO files (id, project_id, node_id, uploaded_by, original_name, stored_name, mime_type, size_bytes, storage_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fileId, req.body.projectId ?? null, req.body.nodeId ?? null,
       req.user!.sub, req.file.originalname, req.file.filename,
       req.file.mimetype, req.file.size, req.file.path]
    );

    res.status(201).json({
      success: true,
      data: {
        file: {
          id: fileId,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          url: `/api/v1/files/${fileId}`,
        },
      },
    });
  } catch (err) { next(err); }
});

// GET /api/v1/files/:id  — download file
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = queryOne<any>('SELECT * FROM files WHERE id = ? AND is_deleted = 0', [req.params.id]);
    if (!file) throw new NotFoundError('File');

    if (!fs.existsSync(file.storage_path)) throw new NotFoundError('File data');

    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
    res.sendFile(file.storage_path);
  } catch (err) { next(err); }
});

// GET /api/v1/files?projectId=xxx
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;
    const files = queryAll(
      'SELECT id, original_name, mime_type, size_bytes, created_at FROM files WHERE project_id = ? AND is_deleted = 0',
      [projectId]
    );
    res.json({ success: true, data: { files } });
  } catch (err) { next(err); }
});

// DELETE /api/v1/files/:id  — soft delete
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = queryOne<any>('SELECT * FROM files WHERE id = ? AND is_deleted = 0', [req.params.id]);
    if (!file) throw new NotFoundError('File');
    if (file.uploaded_by !== req.user!.sub) throw new ForbiddenError();

    execute(
      `UPDATE files SET is_deleted = 1, deleted_at = datetime('now') WHERE id = ?`,
      [req.params.id]
    );

    // Schedule physical deletion (future job)
    res.json({ success: true, data: { message: 'File deleted' } });
  } catch (err) { next(err); }
});

export default router;
