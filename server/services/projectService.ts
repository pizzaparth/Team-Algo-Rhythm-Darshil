/**
 * server/services/projectService.ts
 * Project business logic — CRUD, versioning, graph persistence.
 */

import { projectRepository } from '../repositories/projectRepository.js';
import { sessionRepository } from '../repositories/sessionRepository.js';
import { searchService } from './searchService.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const projectService = {

  // ===================== PROJECTS =====================

  list(userId: string, options: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sort?: string;
  } = {}) {
    return projectRepository.findAllByUser(userId, options);
  },

  getById(projectId: string, userId: string) {
    const project = projectRepository.findById(projectId, userId);
    if (!project) throw new NotFoundError('Project');
    return project;
  },

  create(userId: string, data: {
    name: string;
    description?: string;
    category?: string;
    color?: string;
    tags?: string[];
  }) {
    if (!data.name?.trim()) throw new ValidationError('Project name is required');

    const project = projectRepository.create({
      ownerId: userId,
      name: data.name.trim(),
      description: data.description,
      category: data.category ?? 'general',
      color: data.color,
      tags: data.tags,
    });

    // Save empty initial snapshot
    projectRepository.saveSnapshot({
      projectId: project.id,
      nodesJson: '[]',
      edgesJson: '[]',
      viewportJson: '{}',
      label: 'Initial',
      isCheckpoint: true,
      createdBy: userId,
    });

    // Index in search
    searchService.indexProject(project);

    logger.info('[Project] Created', { projectId: project.id, userId });
    return project;
  },

  update(projectId: string, userId: string, data: {
    name?: string;
    description?: string;
    category?: string;
    color?: string;
    tags?: string[];
    is_favourite?: boolean;
  }) {
    const project = this.getById(projectId, userId);
    if (project.owner_id !== userId) throw new ForbiddenError('You do not own this project');

    projectRepository.update(projectId, {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.is_favourite !== undefined && { is_favourite: data.is_favourite ? 1 : 0 }),
    });

    const updated = projectRepository.findById(projectId, userId)!;
    searchService.indexProject(updated);
    return updated;
  },

  archive(projectId: string, userId: string) {
    const project = this.getById(projectId, userId);
    if (project.owner_id !== userId) throw new ForbiddenError();
    projectRepository.archive(projectId);
    logger.info('[Project] Archived', { projectId, userId });
  },

  delete(projectId: string, userId: string) {
    const project = this.getById(projectId, userId);
    if (project.owner_id !== userId) throw new ForbiddenError();
    projectRepository.softDelete(projectId);
    searchService.removeProject(projectId);
    logger.info('[Project] Deleted', { projectId, userId });
  },

  duplicate(projectId: string, userId: string, newName?: string) {
    const project = this.getById(projectId, userId);
    const duplicateName = newName ?? `${project.name} (Copy)`;
    const dup = projectRepository.duplicate(projectId, userId, duplicateName);
    searchService.indexProject(dup);
    logger.info('[Project] Duplicated', { original: projectId, new: dup.id, userId });
    return dup;
  },

  recent(userId: string, limit = 5) {
    return projectRepository.findRecent(userId, limit);
  },

  favourites(userId: string) {
    return projectRepository.findFavourites(userId);
  },

  templates(category?: string) {
    return projectRepository.findTemplates(category);
  },

  // ===================== GRAPH PERSISTENCE =====================

  loadGraph(projectId: string, userId: string, snapshotId?: string) {
    this.getById(projectId, userId); // Verify access

    // Update last opened
    projectRepository.update(projectId, {
      last_opened_at: new Date().toISOString(),
    });

    const snapshot = snapshotId
      ? projectRepository.getSnapshot(snapshotId)
      : projectRepository.getLatestSnapshot(projectId);

    if (!snapshot) {
      return { nodes: [], edges: [], viewport: {}, version: 0 };
    }

    return {
      nodes: JSON.parse(snapshot.nodes_json),
      edges: JSON.parse(snapshot.edges_json),
      viewport: JSON.parse(snapshot.viewport_json),
      version: snapshot.version_number,
      snapshotId: snapshot.id,
      label: snapshot.label,
    };
  },

  saveGraph(projectId: string, userId: string, data: {
    nodes: any[];
    edges: any[];
    viewport?: any;
    label?: string;
    description?: string;
    isCheckpoint?: boolean;
    isAutosave?: boolean;
  }) {
    this.getById(projectId, userId); // Verify access

    const snapshot = projectRepository.saveSnapshot({
      projectId,
      nodesJson: JSON.stringify(data.nodes),
      edgesJson: JSON.stringify(data.edges),
      viewportJson: JSON.stringify(data.viewport ?? {}),
      label: data.label,
      description: data.description,
      isCheckpoint: data.isCheckpoint,
      isAutosave: data.isAutosave ?? true,
      createdBy: userId,
    });

    // Re-index nodes in search
    data.nodes.forEach(node => {
      searchService.indexNode(projectId, node);
    });

    return {
      version: snapshot.version_number,
      snapshotId: snapshot.id,
      savedAt: snapshot.created_at,
    };
  },

  // ===================== VERSION HISTORY =====================

  getVersionHistory(projectId: string, userId: string) {
    this.getById(projectId, userId);
    return projectRepository.getSnapshotHistory(projectId);
  },

  createCheckpoint(projectId: string, userId: string, label: string, description?: string) {
    const latest = projectRepository.getLatestSnapshot(projectId);
    if (!latest) throw new NotFoundError('No graph state to checkpoint');

    return projectRepository.saveSnapshot({
      projectId,
      ...snapshotJsonFields(latest),
      label,
      description,
      isCheckpoint: true,
      createdBy: userId,
    });
  },

  restoreVersion(projectId: string, userId: string, snapshotId: string) {
    this.getById(projectId, userId);
    const snapshot = projectRepository.getSnapshot(snapshotId);
    if (!snapshot || snapshot.project_id !== projectId) {
      throw new NotFoundError('Version snapshot');
    }

    // Save as new snapshot (restore = new head)
    const restored = projectRepository.saveSnapshot({
      projectId,
      ...snapshotJsonFields(snapshot),
      label: `Restored from version ${snapshot.version_number}`,
      isCheckpoint: true,
      createdBy: userId,
    });

    logger.info('[Project] Version restored', { projectId, from: snapshotId, new: restored.id });
    return restored;
  },
};

/** Pulls the nodes/edges/viewport JSON blobs off an existing snapshot for re-saving as a new one. */
function snapshotJsonFields(snapshot: { nodes_json: string; edges_json: string; viewport_json: string }) {
  return {
    nodesJson: snapshot.nodes_json,
    edgesJson: snapshot.edges_json,
    viewportJson: snapshot.viewport_json,
  };
}
