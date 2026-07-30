/**
 * server/repositories/exportRepository.ts
 * Data access layer for export records.
 */

import { execute, queryAll } from '../database/db.js';

export interface DbExport {
  id: string;
  project_id: string;
  requested_by: string;
  format: string;
  status: string;
  file_id: string | null;
  error_message: string | null;
  options_json: string;
  created_at: string;
  completed_at: string | null;
}

export interface DbExportWithRequester extends DbExport {
  requested_by_name: string;
}

export const exportRepository = {
  create(data: { id: string; projectId: string; userId: string; format: string }): void {
    execute(
      `INSERT INTO exports (id, project_id, requested_by, format, status, completed_at)
       VALUES (?, ?, ?, ?, 'done', datetime('now'))`,
      [data.id, data.projectId, data.userId, data.format]
    );
  },

  listByProject(projectId: string): DbExportWithRequester[] {
    return queryAll<DbExportWithRequester>(
      `SELECT e.*, u.display_name as requested_by_name
       FROM exports e
       JOIN users u ON u.id = e.requested_by
       WHERE e.project_id = ?
       ORDER BY e.created_at DESC LIMIT 50`,
      [projectId]
    );
  },
};
