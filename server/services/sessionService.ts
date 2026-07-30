/**
 * server/services/sessionService.ts
 * AI session persistence — saves/restores full AI workspace state.
 */

import { sessionRepository } from '../repositories/sessionRepository.js';
import { projectRepository } from '../repositories/projectRepository.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const sessionService = {

  getOrCreate(projectId: string, userId: string, domain?: string) {
    // Try to get existing session for this project
    const existing = sessionRepository.findLatestByProject(projectId, userId);
    if (existing) return this._toPublic(existing);

    // Create a new session
    const session = sessionRepository.create({ projectId, userId, domain });
    logger.info('[Session] Created', { sessionId: session.id, projectId, userId });
    return this._toPublic(session);
  },

  getById(sessionId: string, userId: string) {
    const session = sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('AI Session');
    if (session.user_id !== userId) throw new ForbiddenError();
    return this._toPublic(session);
  },

  listByProject(projectId: string, userId: string) {
    return sessionRepository.findByProject(projectId, userId).map(this._toPublic);
  },

  save(sessionId: string, userId: string, data: {
    conversation?: any[];
    planningMemory?: any;
    researchCache?: any[];
    pendingQuestion?: any | null;
    selectedNodeId?: string | null;
    focusedBranchId?: string | null;
    workspaceState?: any;
    tokenCount?: number;
    messageCount?: number;
  }) {
    const session = sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('AI Session');
    if (session.user_id !== userId) throw new ForbiddenError();

    sessionRepository.update(sessionId, {
      ...(data.conversation !== undefined && {
        conversation_json: JSON.stringify(data.conversation),
        message_count: data.conversation.length,
      }),
      ...(data.planningMemory !== undefined && {
        planning_memory_json: JSON.stringify(data.planningMemory),
      }),
      ...(data.researchCache !== undefined && {
        research_cache_json: JSON.stringify(data.researchCache),
      }),
      ...(data.pendingQuestion !== undefined && {
        pending_question_json: data.pendingQuestion ? JSON.stringify(data.pendingQuestion) : null,
      }),
      ...(data.selectedNodeId !== undefined && { selected_node_id: data.selectedNodeId }),
      ...(data.focusedBranchId !== undefined && { focused_branch_id: data.focusedBranchId }),
      ...(data.workspaceState !== undefined && {
        workspace_state_json: JSON.stringify(data.workspaceState),
      }),
      ...(data.tokenCount !== undefined && { token_count: data.tokenCount }),
    });

    return { saved: true, sessionId };
  },

  delete(sessionId: string, userId: string) {
    const session = sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('AI Session');
    if (session.user_id !== userId) throw new ForbiddenError();
    sessionRepository.delete(sessionId);
    logger.info('[Session] Deleted', { sessionId, userId });
  },

  _toPublic(session: any) {
    return {
      id: session.id,
      projectId: session.project_id,
      title: session.title,
      domain: session.domain,
      model: session.model,
      messageCount: session.message_count,
      tokenCount: session.token_count,
      conversation: tryParse(session.conversation_json, []),
      planningMemory: tryParse(session.planning_memory_json, {}),
      researchCache: tryParse(session.research_cache_json, []),
      pendingQuestion: session.pending_question_json ? tryParse(session.pending_question_json, null) : null,
      selectedNodeId: session.selected_node_id,
      focusedBranchId: session.focused_branch_id,
      workspaceState: tryParse(session.workspace_state_json, {}),
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };
  },
};

function tryParse(str: string | null, fallback: any): any {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}
