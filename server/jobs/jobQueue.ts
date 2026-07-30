/**
 * server/jobs/jobQueue.ts
 * Lightweight in-process job queue backed by SQLite.
 * Handles autosave, export generation, cleanup, research.
 * Architecture ready for Redis/Bull upgrade when needed.
 */

import { execute, queryAll, queryOne } from '../database/db.js';
import { uid } from '../utils/id.js';
import { logger } from '../utils/logger.js';

type JobType = 'export' | 'autosave' | 'cleanup' | 'research' | 'notification';
type JobStatus = 'queued' | 'running' | 'done' | 'failed';

interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  payload: any;
  attempts: number;
  max_attempts: number;
  priority: number;
  scheduled_at: string | null;
  created_at: string;
}

type JobHandler = (payload: any) => Promise<void>;

const handlers = new Map<JobType, JobHandler>();

export const jobQueue = {
  /** Register a handler for a job type */
  register(type: JobType, handler: JobHandler): void {
    handlers.set(type, handler);
  },

  /** Enqueue a job */
  enqueue(type: JobType, payload: any, options: {
    priority?: number;
    scheduledAt?: Date;
  } = {}): string {
    const id = uid();
    execute(
      `INSERT INTO jobs (id, type, payload_json, priority, scheduled_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, type, JSON.stringify(payload),
       options.priority ?? 5,
       options.scheduledAt?.toISOString() ?? null]
    );
    logger.debug(`[Queue] Enqueued ${type} job ${id}`);
    return id;
  },

  /** Process one pending job (called by tick) */
  async processPending(): Promise<boolean> {
    const job = queryOne<Job>(
      `SELECT * FROM jobs
       WHERE status = 'queued' AND attempts < max_attempts
         AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))
       ORDER BY priority DESC, created_at ASC
       LIMIT 1`
    );

    if (!job) return false;

    // Mark as running
    execute(
      `UPDATE jobs SET status = 'running', started_at = datetime('now'), attempts = attempts + 1 WHERE id = ?`,
      [job.id]
    );

    const handler = handlers.get(job.type as JobType);
    if (!handler) {
      execute(
        `UPDATE jobs SET status = 'failed', error_message = ?, completed_at = datetime('now') WHERE id = ?`,
        [`No handler registered for type: ${job.type}`, job.id]
      );
      return true;
    }

    try {
      await handler(JSON.parse(job.payload as any));
      execute(
        `UPDATE jobs SET status = 'done', completed_at = datetime('now') WHERE id = ?`,
        [job.id]
      );
      logger.debug(`[Queue] Job ${job.id} (${job.type}) completed`);
    } catch (err: any) {
      const willRetry = job.attempts < job.max_attempts;
      execute(
        `UPDATE jobs SET status = ?, error_message = ?, completed_at = ? WHERE id = ?`,
        [willRetry ? 'queued' : 'failed', err.message,
         willRetry ? null : new Date().toISOString(), job.id]
      );
      logger.warn(`[Queue] Job ${job.id} failed: ${err.message}`);
    }

    return true;
  },

  /** Start background polling ticker (every 5 seconds) */
  startTicker(): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        await this.processPending();
      } catch (err) {
        logger.error('[Queue] Ticker error', { err });
      }
    }, 5000);
  },

  /** Cleanup old completed jobs (run daily) */
  pruneCompleted(): void {
    execute(
      `DELETE FROM jobs WHERE status IN ('done', 'failed')
       AND completed_at < datetime('now', '-7 days')`
    );
  },
};

// =============================================
// Default job handlers
// =============================================

jobQueue.register('cleanup', async (payload: { type: string }) => {
  if (payload.type === 'prune_jobs') {
    jobQueue.pruneCompleted();
    logger.info('[Queue] Pruned old jobs');
  }
});

// Schedule weekly cleanup
jobQueue.enqueue('cleanup', { type: 'prune_jobs' }, {
  scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});
