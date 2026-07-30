/**
 * server/database/db.ts
 * Database connection using Node.js 25 built-in sqlite (node:sqlite).
 * Zero native compilation — uses the V8-embedded SQLite engine.
 *
 * Note: node:sqlite is synchronous and stable in Node 25+.
 */

// @ts-ignore — node:sqlite types not yet in @types/node for v25
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DATABASE_PATH
  ?? path.join(__dirname, '../../data/workspace.db');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let _db: InstanceType<typeof DatabaseSync> | null = null;

export function getDb(): InstanceType<typeof DatabaseSync> {
  if (_db) return _db;

  // Ensure data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  _db = new DatabaseSync(DB_PATH);

  // Performance pragmas
  _db.exec('PRAGMA journal_mode = WAL');
  _db.exec('PRAGMA foreign_keys = ON');
  _db.exec('PRAGMA cache_size = 10000');
  _db.exec('PRAGMA synchronous = NORMAL');
  _db.exec('PRAGMA temp_store = MEMORY');

  // Run schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  _db.exec(schema);

  logger.info(`[DB] Connected to SQLite: ${DB_PATH}`);
  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
    logger.info('[DB] Connection closed');
  }
}

/**
 * Type-safe query: returns first row or undefined.
 */
export function queryOne<T = Record<string, any>>(
  sql: string, params: any[] = []
): T | undefined {
  const stmt = getDb().prepare(sql);
  return stmt.get(...params) as T | undefined;
}

/**
 * Type-safe query: returns all rows.
 */
export function queryAll<T = Record<string, any>>(
  sql: string, params: any[] = []
): T[] {
  const stmt = getDb().prepare(sql);
  return stmt.all(...params) as T[];
}

/**
 * Execute INSERT/UPDATE/DELETE. Returns { changes, lastInsertRowid }.
 */
export function execute(sql: string, params: any[] = []): any {
  const stmt = getDb().prepare(sql);
  return stmt.run(...params);
}

/**
 * Run multiple statements in a transaction.
 */
export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
