/**
 * eventBus.ts — Lightweight Typed Pub/Sub Event Bus
 *
 * Provides decoupled component communication. Events are fire-and-forget.
 * No component is required to listen — this is for observability and
 * future plugin hooks, not for core state flow (which uses Zustand).
 *
 * Usage:
 *   eventBus.on('NODE_SELECTED', (payload) => { ... });
 *   eventBus.emit('NODE_SELECTED', { nodeId: 'node-1' });
 *   const unsub = eventBus.on('AI_RESPONSE_CHUNK', handler);
 *   unsub(); // unsubscribe
 */

export type EventType =
  | 'NODE_SELECTED'
  | 'NODE_EXPANDED'
  | 'NODE_DELETED'
  | 'NODE_CREATED'
  | 'NODE_UPDATED'
  | 'GRAPH_CHANGED'
  | 'BRANCH_FOCUSED'
  | 'AI_RESPONSE_START'
  | 'AI_RESPONSE_CHUNK'
  | 'AI_RESPONSE_END'
  | 'AI_QUESTION_ASKED'
  | 'AI_QUESTION_ANSWERED'
  | 'AI_SUGGESTION_CREATED'
  | 'AI_COMMAND_EXECUTED'
  | 'CONVERSATION_UPDATED'
  | 'SESSION_STATE_CHANGED';

type Listener = (payload: Record<string, any>) => void;

class EventBus {
  private listeners: Map<EventType, Set<Listener>> = new Map();

  on(event: EventType, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  emit(event: EventType, payload: Record<string, any> = {}): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    const enrichedPayload = { ...payload, _timestamp: Date.now() };
    eventListeners.forEach((listener) => {
      try {
        listener(enrichedPayload);
      } catch (err) {
        console.error(`[EventBus] Error in listener for "${event}":`, err);
      }
    });
  }

  off(event: EventType, listener: Listener): void {
    this.listeners.get(event)?.delete(listener);
  }

  /** Remove all listeners — useful for cleanup/testing */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance
export const eventBus = new EventBus();
