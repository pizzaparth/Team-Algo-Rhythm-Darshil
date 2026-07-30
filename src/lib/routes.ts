import type { ViewMode } from '../types';

export const ROUTE_TO_VIEW_MODE: Record<string, ViewMode> = {
  '/home': 'landing',
  '/chat': 'chat',
  '/graphcanvas': 'workspace',
  '/editor': 'editor',
};

export const VIEW_MODE_TO_ROUTE: Record<ViewMode, string> = {
  landing: '/home',
  chat: '/chat',
  workspace: '/graphcanvas',
  editor: '/editor',
};
