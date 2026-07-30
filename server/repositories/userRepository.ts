/**
 * server/repositories/userRepository.ts
 * Data access layer for users. No business logic here.
 */

import { queryOne, queryAll, execute } from '../database/db.js';
import { uid } from '../utils/id.js';

export interface DbUser {
  id: string;
  email: string;
  username: string;
  password_hash: string | null;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: number;
  is_active: number;
  oauth_provider: string | null;
  oauth_id: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  email_verify_token: string | null;
  password_reset_token: string | null;
  password_reset_expires: string | null;
}

export interface DbUserPreferences {
  user_id: string;
  theme: string;
  default_domain: string;
  ai_verbosity: string;
  auto_expand: number;
  show_evidence: number;
  show_experts: number;
  show_historical: number;
  graph_layout: string;
  export_format: string;
  notifications_enabled: number;
  updated_at: string;
}

export const userRepository = {
  findById(id: string): DbUser | undefined {
    return queryOne<DbUser>('SELECT * FROM users WHERE id = ? AND is_active = 1', [id]);
  },

  findByEmail(email: string): DbUser | undefined {
    return queryOne<DbUser>('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
  },

  findByUsername(username: string): DbUser | undefined {
    return queryOne<DbUser>('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
  },

  findByOAuth(provider: string, oauthId: string): DbUser | undefined {
    return queryOne<DbUser>(
      'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
      [provider, oauthId]
    );
  },

  create(data: {
    email: string;
    username: string;
    display_name: string;
    password_hash?: string | null;
    oauth_provider?: string | null;
    oauth_id?: string | null;
    email_verify_token?: string | null;
    is_verified?: number;
  }): DbUser {
    const id = uid();
    execute(
      `INSERT INTO users (id, email, username, display_name, password_hash, oauth_provider, oauth_id, email_verify_token, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.email, data.username, data.display_name,
       data.password_hash ?? null, data.oauth_provider ?? null,
       data.oauth_id ?? null, data.email_verify_token ?? null,
       data.is_verified ?? 0]
    );
    // Create default preferences
    execute(
      'INSERT INTO user_preferences (user_id) VALUES (?)',
      [id]
    );
    return this.findById(id)!;
  },

  update(id: string, data: Partial<{
    display_name: string;
    avatar_url: string;
    bio: string;
    password_hash: string;
    is_verified: number;
    last_login_at: string;
    email_verify_token: string | null;
    password_reset_token: string | null;
    password_reset_expires: string | null;
  }>): void {
    const fields = Object.entries(data)
      .map(([key]) => `${key} = ?`)
      .join(', ');
    const values = Object.values(data);
    execute(
      `UPDATE users SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
      [...values, id]
    );
  },

  getPreferences(userId: string): DbUserPreferences | undefined {
    return queryOne<DbUserPreferences>(
      'SELECT * FROM user_preferences WHERE user_id = ?', [userId]
    );
  },

  updatePreferences(userId: string, data: Partial<Omit<DbUserPreferences, 'user_id' | 'updated_at'>>): void {
    const fields = Object.entries(data).map(([k]) => `${k} = ?`).join(', ');
    execute(
      `UPDATE user_preferences SET ${fields}, updated_at = datetime('now') WHERE user_id = ?`,
      [...Object.values(data), userId]
    );
  },

  saveRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): void {
    execute(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, user_agent, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uid(), data.userId, data.tokenHash,
       data.expiresAt.toISOString(), data.userAgent ?? null, data.ipAddress ?? null]
    );
  },

  findRefreshToken(tokenHash: string): { user_id: string; expires_at: string; revoked: number } | undefined {
    return queryOne(
      'SELECT user_id, expires_at, revoked FROM refresh_tokens WHERE token_hash = ?',
      [tokenHash]
    );
  },

  revokeRefreshToken(tokenHash: string): void {
    execute(
      `UPDATE refresh_tokens SET revoked = 1, revoked_at = datetime('now') WHERE token_hash = ?`,
      [tokenHash]
    );
  },

  revokeAllUserTokens(userId: string): void {
    execute(
      `UPDATE refresh_tokens SET revoked = 1, revoked_at = datetime('now') WHERE user_id = ?`,
      [userId]
    );
  },
};
