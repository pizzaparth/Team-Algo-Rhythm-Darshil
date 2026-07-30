/**
 * server/utils/id.ts
 * ID and token generation utilities.
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const uid = () => uuidv4();

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
