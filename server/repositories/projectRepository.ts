/**
 * server/repositories/projectRepository.ts
 * Data access layer for projects and graph snapshots.
 */

import { queryOne, queryAll, execute, transaction } from '../database/db.js';
import { uid } from '../utils/id.js';

export interface DbProject {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  is_favourite: number;
  is_template: number;
  template_category: string | null;
  node_count: number;
  thumbnail_url: string | null;
  color: string;
  tags: string;
  settings: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
}

export interface DbGraphSnapshot {
  id: string;
  project_id: string;
  version_number: number;
  label: string | null;
  description: string | null;
  is_checkpoint: number;
  is_autosave: number;
  nodes_json: string;
  edges_json: string;
  viewport_json: string;
  metadata_json: string;
  created_at: string;
  created_by: string | null;
}

export const projectRepository = {
  // ===================== PROJECTS =====================

  findById(id: string, userId: string): DbProject | undefined {
    return queryOne<DbProject>(
      `SELECT p.* FROM projects p
       LEFT JOIN project_collaborators pc ON pc.project_id = p.id AND pc.user_id = ?
       WHERE p.id = ? AND p.status != 'deleted' AND (p.owner_id = ? OR pc.user_id = ?)`,
      [userId, id, userId, userId]
    );
  },

  findAllByUser(userId: string, options: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sort?: string;
  } = {}): { projects: DbProject[]; total: number } {
    const { status = 'active', search, limit = 20, offset = 0, sort = 'updated_at' } = options;
    const safeSort = ['updated_at', 'created_at', 'name', 'last_opened_at'].includes(sort) ? sort : 'updated_at';

    let where = `WHERE p.owner_id = ? AND p.status = ?`;
    const params: any[] = [userId, status];

    if (search) {
      where += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const total = queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM projects p ${where}`, params
    )?.count ?? 0;

    const projects = queryAll<DbProject>(
      `SELECT p.* FROM projects p ${where} ORDER BY p.${safeSort} DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { projects, total };
  },

  findRecent(userId: string, limit = 5): DbProject[] {
    return queryAll<DbProject>(
      `SELECT * FROM projects WHERE owner_id = ? AND status = 'active'
       ORDER BY last_opened_at DESC LIMIT ?`,
      [userId, limit]
    );
  },

  findFavourites(userId: string): DbProject[] {
    return queryAll<DbProject>(
      `SELECT * FROM projects WHERE owner_id = ? AND is_favourite = 1 AND status = 'active'
       ORDER BY updated_at DESC`,
      [userId]
    );
  },

  findTemplates(category?: string): DbProject[] {
    if (category) {
      return queryAll<DbProject>(
        `SELECT * FROM projects WHERE is_template = 1 AND template_category = ? ORDER BY name`,
        [category]
      );
    }
    return queryAll<DbProject>(
      'SELECT * FROM projects WHERE is_template = 1 ORDER BY template_category, name'
    );
  },

  create(data: {
    ownerId: string;
    name: string;
    description?: string;
    category?: string;
    color?: string;
    tags?: string[];
  }): DbProject {
    const id = uid();
    execute(
      `INSERT INTO projects (id, owner_id, name, description, category, color, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.ownerId, data.name, data.description ?? null,
       data.category ?? 'general', data.color ?? '#6366f1',
       JSON.stringify(data.tags ?? [])]
    );
    return this.findById(id, data.ownerId)!;
  },

  update(id: string, data: Partial<{
    name: string;
    description: string;
    category: string;
    color: string;
    tags: string[];
    node_count: number;
    is_favourite: number;
    status: string;
    thumbnail_url: string;
    settings: string;
    template_category: string;
    is_template: number;
    last_opened_at: string;
  }>): void {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (key === 'tags' && Array.isArray(value)) {
        fields.push('tags = ?');
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return;
    execute(
      `UPDATE projects SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
      [...values, id]
    );
  },

  archive(id: string): void {
    execute(
      `UPDATE projects SET status = 'archived', archived_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  },

  softDelete(id: string): void {
    execute(
      `UPDATE projects SET status = 'deleted', deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  },

  duplicate(id: string, userId: string, newName: string): DbProject {
    const original = this.findById(id, userId);
    if (!original) throw new Error('Project not found');

    const newId = uid();
    execute(
      `INSERT INTO projects (id, owner_id, name, description, category, color, tags, settings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, userId, newName, original.description, original.category,
       original.color, original.tags, original.settings]
    );

    // Copy latest snapshot
    const latestSnapshot = this.getLatestSnapshot(id);
    if (latestSnapshot) {
      execute(
        `INSERT INTO graph_snapshots (id, project_id, version_number, label, nodes_json, edges_json, viewport_json, created_by, is_checkpoint)
         VALUES (?, ?, 1, 'Initial copy', ?, ?, ?, ?, 1)`,
        [uid(), newId, latestSnapshot.nodes_json, latestSnapshot.edges_json,
         latestSnapshot.viewport_json, userId]
      );
      const nodeCount = JSON.parse(latestSnapshot.nodes_json).length;
      execute('UPDATE projects SET node_count = ? WHERE id = ?', [nodeCount, newId]);
    }

    return this.findById(newId, userId)!;
  },

  // ===================== GRAPH SNAPSHOTS =====================

  getLatestSnapshot(projectId: string): DbGraphSnapshot | undefined {
    return queryOne<DbGraphSnapshot>(
      `SELECT * FROM graph_snapshots WHERE project_id = ? ORDER BY version_number DESC LIMIT 1`,
      [projectId]
    );
  },

  getSnapshotHistory(projectId: string, limit = 50): DbGraphSnapshot[] {
    return queryAll<DbGraphSnapshot>(
      `SELECT id, project_id, version_number, label, description, is_checkpoint, is_autosave, created_at, created_by
       FROM graph_snapshots WHERE project_id = ? ORDER BY version_number DESC LIMIT ?`,
      [projectId, limit]
    );
  },

  getSnapshot(id: string): DbGraphSnapshot | undefined {
    return queryOne<DbGraphSnapshot>('SELECT * FROM graph_snapshots WHERE id = ?', [id]);
  },

  saveSnapshot(data: {
    projectId: string;
    nodesJson: string;
    edgesJson: string;
    viewportJson?: string;
    metadataJson?: string;
    label?: string;
    description?: string;
    isCheckpoint?: boolean;
    isAutosave?: boolean;
    createdBy?: string;
  }): DbGraphSnapshot {
    const id = insertSnapshot(data);
    updateProjectNodeCount(data.projectId, data.nodesJson);
    pruneOldAutosaves(data.projectId);
    return this.getSnapshot(id)!;
  },

  deleteSnapshot(id: string): void {
    execute('DELETE FROM graph_snapshots WHERE id = ?', [id]);
  },
};

function insertSnapshot(data: {
  projectId: string;
  nodesJson: string;
  edgesJson: string;
  viewportJson?: string;
  metadataJson?: string;
  label?: string;
  description?: string;
  isCheckpoint?: boolean;
  isAutosave?: boolean;
  createdBy?: string;
}): string {
  const nextVersion = (queryOne<{ v: number }>(
    'SELECT COALESCE(MAX(version_number), 0) + 1 as v FROM graph_snapshots WHERE project_id = ?',
    [data.projectId]
  )?.v) ?? 1;

  const id = uid();
  execute(
    `INSERT INTO graph_snapshots
       (id, project_id, version_number, label, description, is_checkpoint, is_autosave, nodes_json, edges_json, viewport_json, metadata_json, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.projectId, nextVersion, data.label ?? null, data.description ?? null,
     data.isCheckpoint ? 1 : 0, data.isAutosave ? 1 : 0,
     data.nodesJson, data.edgesJson,
     data.viewportJson ?? '{}', data.metadataJson ?? '{}',
     data.createdBy ?? null]
  );
  return id;
}

function updateProjectNodeCount(projectId: string, nodesJson: string): void {
  const nodeCount = JSON.parse(nodesJson).length;
  execute(
    `UPDATE projects SET node_count = ?, updated_at = datetime('now') WHERE id = ?`,
    [nodeCount, projectId]
  );
}

function pruneOldAutosaves(projectId: string): void {
  execute(
    `DELETE FROM graph_snapshots WHERE project_id = ? AND is_autosave = 1
     AND id NOT IN (SELECT id FROM graph_snapshots WHERE project_id = ? AND is_autosave = 1 ORDER BY version_number DESC LIMIT 20)`,
    [projectId, projectId]
  );
}
