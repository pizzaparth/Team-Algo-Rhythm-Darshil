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
import { fileService } from '../services/fileService.js';
import { uid } from '../utils/id.js';
import { ValidationError } from '../utils/errors.js';

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
    if (!req.file) throw new ValidationError('No file uploaded');

    const file = fileService.upload({
      projectId: req.body.projectId ?? null,
      nodeId: req.body.nodeId ?? null,
      uploadedBy: req.user!.sub,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      storagePath: req.file.path,
    });

    res.status(201).json({ success: true, data: { file } });
  } catch (err) { next(err); }
});

// GET /api/v1/files/:id  — download file
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = fileService.getForDownload(req.params.id);
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
    res.sendFile(file.storage_path);
  } catch (err) { next(err); }
});

// GET /api/v1/files?projectId=xxx
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;
    const files = fileService.listByProject(projectId as string);
    res.json({ success: true, data: { files } });
  } catch (err) { next(err); }
});

// DELETE /api/v1/files/:id  — soft delete
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    fileService.delete(req.params.id, req.user!.sub);
    res.json({ success: true, data: { message: 'File deleted' } });
  } catch (err) { next(err); }
});

export default router;
