/**
 * server/database/schema.sql
 * Complete SQLite schema for the AI Reasoning Workspace backend.
 * Designed for Phase 5 — production-ready, collaboration-ready.
 */

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,                     -- null for OAuth-only users
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  oauth_provider TEXT,                    -- 'google' | 'github' | null
  oauth_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT,
  email_verify_token TEXT,
  password_reset_token TEXT,
  password_reset_expires TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);

-- ============================================================
-- USER PREFERENCES
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark',
  default_domain TEXT NOT NULL DEFAULT 'general',
  ai_verbosity TEXT NOT NULL DEFAULT 'balanced',    -- 'concise' | 'balanced' | 'detailed'
  auto_expand INTEGER NOT NULL DEFAULT 0,
  show_evidence INTEGER NOT NULL DEFAULT 1,
  show_experts INTEGER NOT NULL DEFAULT 1,
  show_historical INTEGER NOT NULL DEFAULT 1,
  graph_layout TEXT NOT NULL DEFAULT 'horizontal',
  export_format TEXT NOT NULL DEFAULT 'markdown',
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked INTEGER NOT NULL DEFAULT 0,
  revoked_at TEXT,
  user_agent TEXT,
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token ON refresh_tokens(token_hash);

-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'active',           -- 'active' | 'archived' | 'deleted'
  is_favourite INTEGER NOT NULL DEFAULT 0,
  is_template INTEGER NOT NULL DEFAULT 0,
  template_category TEXT,
  node_count INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  tags TEXT NOT NULL DEFAULT '[]',                 -- JSON array
  settings TEXT NOT NULL DEFAULT '{}',             -- JSON object
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_opened_at TEXT,
  archived_at TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_template ON projects(is_template, template_category);

-- ============================================================
-- PROJECT COLLABORATORS (architecture only — not fully implemented)
-- ============================================================

CREATE TABLE IF NOT EXISTS project_collaborators (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',             -- 'viewer' | 'commenter' | 'editor' | 'admin'
  invited_by TEXT REFERENCES users(id),
  invited_at TEXT NOT NULL DEFAULT (datetime('now')),
  accepted_at TEXT,
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collab_project ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_collab_user ON project_collaborators(user_id);

-- ============================================================
-- GRAPH SNAPSHOTS (full versioned graph state)
-- ============================================================

CREATE TABLE IF NOT EXISTS graph_snapshots (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  label TEXT,                                      -- user-given version name
  description TEXT,
  is_checkpoint INTEGER NOT NULL DEFAULT 0,        -- manual checkpoint
  is_autosave INTEGER NOT NULL DEFAULT 0,
  nodes_json TEXT NOT NULL DEFAULT '[]',           -- full GraphNode[] JSON
  edges_json TEXT NOT NULL DEFAULT '[]',           -- full GraphEdge[] JSON
  viewport_json TEXT NOT NULL DEFAULT '{}',        -- { x, y, zoom }
  metadata_json TEXT NOT NULL DEFAULT '{}',        -- extra metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_project ON graph_snapshots(project_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_checkpoint ON graph_snapshots(project_id, is_checkpoint);

-- ============================================================
-- AI SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  domain TEXT NOT NULL DEFAULT 'general',
  conversation_json TEXT NOT NULL DEFAULT '[]',    -- ChatMessage[] JSON
  planning_memory_json TEXT NOT NULL DEFAULT '{}', -- PlanningMemorySnapshot JSON
  research_cache_json TEXT NOT NULL DEFAULT '[]',  -- ProcessedResearch[] JSON
  pending_question_json TEXT,                      -- AIQuestion | null JSON
  selected_node_id TEXT,
  focused_branch_id TEXT,
  workspace_state_json TEXT NOT NULL DEFAULT '{}', -- misc workspace state
  model TEXT NOT NULL DEFAULT 'mimo-v2.5-pro',
  token_count INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_project ON ai_sessions(project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON ai_sessions(user_id, updated_at DESC);

-- ============================================================
-- FILES / ATTACHMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  node_id TEXT,                                    -- optional node attachment
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,                       -- UUID-based filename on disk
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_node ON files(node_id);

-- ============================================================
-- EXPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS exports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL REFERENCES users(id),
  format TEXT NOT NULL,                            -- 'markdown' | 'json' | 'pdf' | 'mermaid'
  status TEXT NOT NULL DEFAULT 'pending',          -- 'pending' | 'processing' | 'done' | 'failed'
  file_id TEXT REFERENCES files(id),
  error_message TEXT,
  options_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_exports_project ON exports(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exports_user ON exports(requested_by, created_at DESC);

-- ============================================================
-- SEARCH INDEX (denormalised for fast full-text search)
-- ============================================================

CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
  project_id UNINDEXED,
  entity_type,    -- 'project' | 'node' | 'note' | 'conversation' | 'bookmark'
  entity_id UNINDEXED,
  title,
  body,
  tags
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details_json TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

-- ============================================================
-- BACKGROUND JOBS
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                              -- 'export' | 'autosave' | 'cleanup' | 'research'
  status TEXT NOT NULL DEFAULT 'queued',           -- 'queued' | 'running' | 'done' | 'failed'
  payload_json TEXT NOT NULL DEFAULT '{}',
  result_json TEXT,
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  priority INTEGER NOT NULL DEFAULT 5,
  scheduled_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status, priority DESC, scheduled_at);

-- ============================================================
-- TEMPLATES
-- ============================================================

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  nodes_json TEXT NOT NULL DEFAULT '[]',
  edges_json TEXT NOT NULL DEFAULT '[]',
  thumbnail_url TEXT,
  is_system INTEGER NOT NULL DEFAULT 0,            -- built-in vs user-created
  created_by TEXT REFERENCES users(id),
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
