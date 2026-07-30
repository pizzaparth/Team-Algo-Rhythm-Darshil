/**
 * server/services/searchService.ts
 * Full-text search using SQLite FTS5. Indexes projects, nodes, sessions.
 */

import { execute, queryAll, getDb } from '../database/db.js';
import { uid } from '../utils/id.js';

export const searchService = {
  indexProject(project: any): void {
    try {
      // Remove old entry
      execute(
        `DELETE FROM search_index WHERE project_id = ? AND entity_type = 'project'`,
        [project.id]
      );
      execute(
        `INSERT INTO search_index (project_id, entity_type, entity_id, title, body, tags)
         VALUES (?, 'project', ?, ?, ?, ?)`,
        [project.id, project.id, project.name,
         project.description ?? '', project.tags ?? '']
      );
    } catch { /* Non-fatal */ }
  },

  indexNode(projectId: string, node: any): void {
    try {
      execute(
        `DELETE FROM search_index WHERE project_id = ? AND entity_type = 'node' AND entity_id = ?`,
        [projectId, node.id]
      );
      execute(
        `INSERT INTO search_index (project_id, entity_type, entity_id, title, body, tags)
         VALUES (?, 'node', ?, ?, ?, ?)`,
        [projectId, node.id, node.data?.title ?? '',
         node.data?.summary ?? '', node.data?.internalType ?? '']
      );
    } catch { /* Non-fatal */ }
  },

  removeProject(projectId: string): void {
    try {
      execute(`DELETE FROM search_index WHERE project_id = ?`, [projectId]);
    } catch { /* Non-fatal */ }
  },

  search(userId: string, query: string, options: {
    type?: string;
    projectId?: string;
    limit?: number;
  } = {}): any[] {
    const { type, projectId, limit = 20 } = options;

    // FTS5 query — escape special chars
    const ftsQuery = query.replace(/['"*()]/g, ' ').trim();
    if (!ftsQuery) return [];

    try {
      let sql = `
        SELECT si.entity_type, si.entity_id, si.project_id, si.title, si.body,
               p.name as project_name, p.owner_id
        FROM search_index si
        JOIN projects p ON p.id = si.project_id
        WHERE search_index MATCH ?
          AND p.owner_id = ?
          AND p.status != 'deleted'
      `;
      const params: any[] = [ftsQuery, userId];

      if (type) { sql += ` AND si.entity_type = ?`; params.push(type); }
      if (projectId) { sql += ` AND si.project_id = ?`; params.push(projectId); }
      sql += ` ORDER BY rank LIMIT ?`;
      params.push(limit);

      return queryAll(sql, params);
    } catch {
      return [];
    }
  },
};
