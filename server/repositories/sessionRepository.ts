/**
 * server/repositories/sessionRepository.ts
 * Data access layer for AI sessions.
 */

import { queryOne, queryAll, execute } from '../database/db.js';
import { uid } from '../utils/id.js';

export interface DbAISession {
  id: string;
  project_id: string;
  user_id: string;
  title: string | null;
  domain: string;
  conversation_json: string;
  planning_memory_json: string;
  research_cache_json: string;
  pending_question_json: string | null;
  selected_node_id: string | null;
  focused_branch_id: string | null;
  workspace_state_json: string;
  model: string;
  token_count: number;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export const sessionRepository = {
  findById(id: string): DbAISession | undefined {
    return queryOne<DbAISession>('SELECT * FROM ai_sessions WHERE id = ?', [id]);
  },

  findByProject(projectId: string, userId: string): DbAISession[] {
    return queryAll<DbAISession>(
      `SELECT * FROM ai_sessions WHERE project_id = ? AND user_id = ? ORDER BY updated_at DESC`,
      [projectId, userId]
    );
  },

  findLatestByProject(projectId: string, userId: string): DbAISession | undefined {
    return queryOne<DbAISession>(
      `SELECT * FROM ai_sessions WHERE project_id = ? AND user_id = ? ORDER BY updated_at DESC LIMIT 1`,
      [projectId, userId]
    );
  },

  create(data: {
    projectId: string;
    userId: string;
    title?: string;
    domain?: string;
    model?: string;
  }): DbAISession {
    const id = uid();
    execute(
      `INSERT INTO ai_sessions (id, project_id, user_id, title, domain, model)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.projectId, data.userId, data.title ?? null,
       data.domain ?? 'general', data.model ?? 'mimo-v2.5-pro']
    );
    return this.findById(id)!;
  },

  update(id: string, data: Partial<{
    title: string;
    conversation_json: string;
    planning_memory_json: string;
    research_cache_json: string;
    pending_question_json: string | null;
    selected_node_id: string | null;
    focused_branch_id: string | null;
    workspace_state_json: string;
    token_count: number;
    message_count: number;
  }>): void {
    const fields = Object.entries(data).map(([k]) => `${k} = ?`).join(', ');
    execute(
      `UPDATE ai_sessions SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
      [...Object.values(data), id]
    );
  },

  delete(id: string): void {
    execute('DELETE FROM ai_sessions WHERE id = ?', [id]);
  },
};
