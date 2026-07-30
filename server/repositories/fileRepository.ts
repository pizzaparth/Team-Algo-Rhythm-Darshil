/**
 * server/repositories/fileRepository.ts
 * Data access layer for uploaded files. No business logic here.
 */

import { queryOne, queryAll, execute } from '../database/db.js';
import { uid } from '../utils/id.js';

export interface DbFile {
  id: string;
  project_id: string | null;
  node_id: string | null;
  uploaded_by: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  is_deleted: number;
  created_at: string;
  deleted_at: string | null;
}

export interface DbFileSummary {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export const fileRepository = {
  create(data: {
    projectId: string | null;
    nodeId: string | null;
    uploadedBy: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
  }): DbFile {
    const id = uid();
    execute(
      `INSERT INTO files (id, project_id, node_id, uploaded_by, original_name, stored_name, mime_type, size_bytes, storage_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.projectId, data.nodeId, data.uploadedBy, data.originalName,
       data.storedName, data.mimeType, data.sizeBytes, data.storagePath]
    );
    return this.findById(id)!;
  },

  findById(id: string): DbFile | undefined {
    return queryOne<DbFile>('SELECT * FROM files WHERE id = ? AND is_deleted = 0', [id]);
  },

  listByProject(projectId: string): DbFileSummary[] {
    return queryAll<DbFileSummary>(
      'SELECT id, original_name, mime_type, size_bytes, created_at FROM files WHERE project_id = ? AND is_deleted = 0',
      [projectId]
    );
  },

  softDelete(id: string): void {
    execute(
      `UPDATE files SET is_deleted = 1, deleted_at = datetime('now') WHERE id = ?`,
      [id]
    );
  },
};
