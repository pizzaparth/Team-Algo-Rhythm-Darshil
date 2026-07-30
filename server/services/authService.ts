/**
 * server/services/authService.ts
 * Authentication business logic — isolated from HTTP layer.
 */

import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../middleware/auth.js';
import { uid, randomToken, hashToken } from '../utils/id.js';
import {
  ConflictError, UnauthorizedError, NotFoundError, ValidationError
} from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const SALT_ROUNDS = 12;
const REFRESH_TTL_DAYS = 7;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
}

function toPublicUser(u: any): PublicUser {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.display_name,
    avatarUrl: u.avatar_url,
    isVerified: u.is_verified === 1,
    createdAt: u.created_at,
  };
}

export const authService = {
  async register(data: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    // Check uniqueness
    if (userRepository.findByEmail(data.email)) {
      throw new ConflictError('Email is already registered');
    }
    if (userRepository.findByUsername(data.username)) {
      throw new ConflictError('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const verifyToken_str = randomToken();

    const user = userRepository.create({
      email: data.email.toLowerCase().trim(),
      username: data.username.toLowerCase().trim(),
      display_name: data.displayName,
      password_hash: passwordHash,
      email_verify_token: hashToken(verifyToken_str),
      is_verified: 1, // Auto-verify in dev; in prod send email
    });

    logger.info('[Auth] User registered', { userId: user.id, email: user.email });

    const tokens = await this._issueTokens(user);
    return { user: toPublicUser(user), tokens };
  },

  async login(data: {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = userRepository.findByEmail(data.email.toLowerCase().trim());
    if (!user || !user.is_active) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (!user.password_hash) {
      throw new UnauthorizedError('This account uses social login. Please sign in with your provider.');
    }

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    userRepository.update(user.id, { last_login_at: new Date().toISOString() });

    logger.info('[Auth] User logged in', { userId: user.id });
    const tokens = await this._issueTokens(user, data.userAgent, data.ipAddress);
    return { user: toPublicUser(user), tokens };
  },

  async refreshTokens(rawRefreshToken: string): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = userRepository.findRefreshToken(tokenHash);

    if (!stored || stored.revoked) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    if (new Date(stored.expires_at) < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Rotate: revoke old, issue new
    userRepository.revokeRefreshToken(tokenHash);

    const user = userRepository.findById(stored.user_id);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('User not found');
    }

    const tokens = await this._issueTokens(user);
    return { user: toPublicUser(user), tokens };
  },

  logout(rawRefreshToken: string): void {
    const tokenHash = hashToken(rawRefreshToken);
    userRepository.revokeRefreshToken(tokenHash);
    logger.info('[Auth] Token revoked');
  },

  logoutAll(userId: string): void {
    userRepository.revokeAllUserTokens(userId);
    logger.info('[Auth] All tokens revoked', { userId });
  },

  getProfile(userId: string): PublicUser {
    const user = userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return toPublicUser(user);
  },

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = userRepository.findById(userId);
    if (!user || !user.password_hash) throw new NotFoundError('User');

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    userRepository.update(userId, { password_hash: newHash });
    userRepository.revokeAllUserTokens(userId);
    logger.info('[Auth] Password changed', { userId });
  },

  async _issueTokens(
    user: any,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const rawRefresh = randomToken();
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 86400 * 1000);

    userRepository.saveRefreshToken({
      userId: user.id,
      tokenHash: hashToken(rawRefresh),
      expiresAt,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken: rawRefresh,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  },
};
