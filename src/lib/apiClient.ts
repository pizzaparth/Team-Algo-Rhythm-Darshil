/**
 * src/lib/apiClient.ts — Frontend HTTP client for the Phase 5 backend.
 *
 * Wraps all /api/v1/* calls with:
 * - Automatic Authorization header injection
 * - Token refresh on 401
 * - Typed response handling
 * - Error normalisation
 *
 * All stores and services should use this instead of raw fetch.
 */

const BASE = '/api/v1';

// =============================================
// Token storage (in-memory + localStorage)
// =============================================

let _accessToken: string | null = localStorage.getItem('accessToken');
let _refreshToken: string | null = localStorage.getItem('refreshToken');
let _isRefreshing = false;
let _refreshQueue: Array<(token: string | null) => void> = [];

export function setTokens(access: string, refresh: string): void {
  _accessToken = access;
  _refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens(): void {
  _accessToken = null;
  _refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getAccessToken(): string | null { return _accessToken; }
export function isAuthenticated(): boolean { return !!_accessToken; }

// =============================================
// Core fetch wrapper
// =============================================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; errors?: any[] };
}

export class ApiError extends Error {
  code: string;
  status: number;
  errors?: any[];

  constructor(message: string, code: string, status: number, errors?: any[]) {
    super(message);
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

async function request<T = any>(
  method: string,
  path: string,
  body?: any,
  headers?: Record<string, string>,
): Promise<T> {
  const doRequest = async (token: string | null): Promise<Response> => {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (token) h['Authorization'] = `Bearer ${token}`;

    return fetch(`${BASE}${path}`, {
      method,
      headers: h,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doRequest(_accessToken);

  // Handle 401 — attempt token refresh
  if (res.status === 401 && _refreshToken) {
    if (_isRefreshing) {
      // Wait for the ongoing refresh
      const newToken = await new Promise<string | null>(resolve => {
        _refreshQueue.push(resolve);
      });
      if (newToken) {
        res = await doRequest(newToken);
      }
    } else {
      _isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: _refreshToken }),
        });

        if (refreshRes.ok) {
          const data: ApiResponse = await refreshRes.json();
          if (data.success && data.data?.tokens) {
            setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
            _refreshQueue.forEach(cb => cb(data.data!.tokens.accessToken));
            _refreshQueue = [];
            res = await doRequest(data.data.tokens.accessToken);
          } else {
            clearTokens();
            _refreshQueue.forEach(cb => cb(null));
            _refreshQueue = [];
          }
        } else {
          clearTokens();
          _refreshQueue.forEach(cb => cb(null));
          _refreshQueue = [];
        }
      } finally {
        _isRefreshing = false;
      }
    }
  }

  // Parse response
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json') || contentType.includes('text/')) {
    const isJson = contentType.includes('json');
    const parsed: ApiResponse = isJson ? await res.json() : { success: res.ok, data: await res.text() };

    if (!res.ok || !parsed.success) {
      throw new ApiError(
        parsed.error?.message ?? 'Request failed',
        parsed.error?.code ?? 'REQUEST_FAILED',
        res.status,
        parsed.error?.errors,
      );
    }
    return parsed.data as T;
  }

  // Binary response (file download)
  if (!res.ok) throw new ApiError('Download failed', 'DOWNLOAD_FAILED', res.status);
  return res as any;
}

// =============================================
// Convenience methods
// =============================================

export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: any) => request<T>('POST', path, body),
  put: <T = any>(path: string, body?: any) => request<T>('PUT', path, body),
  patch: <T = any>(path: string, body?: any) => request<T>('PATCH', path, body),
  delete: <T = any>(path: string) => request<T>('DELETE', path),

  // ==========================================
  // Auth
  // ==========================================
  auth: {
    register: (data: { email: string; username: string; displayName: string; password: string }) =>
      request<{ user: any; tokens: any }>('POST', '/auth/register', data),

    login: (data: { email: string; password: string }) =>
      request<{ user: any; tokens: any }>('POST', '/auth/login', data),

    logout: (refreshToken: string) =>
      request('POST', '/auth/logout', { refreshToken }),

    me: () => request<{ user: any }>('GET', '/auth/me'),

    updatePassword: (data: { currentPassword: string; newPassword: string }) =>
      request('PUT', '/auth/password', data),
  },

  // ==========================================
  // Projects
  // ==========================================
  projects: {
    list: (params?: { status?: string; search?: string; limit?: number; offset?: number }) => {
      const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return request<{ projects: any[]; total: number }>('GET', `/projects${qs}`);
    },
    recent: () => request<{ projects: any[] }>('GET', '/projects/recent'),
    favourites: () => request<{ projects: any[] }>('GET', '/projects/favourites'),
    templates: (category?: string) => {
      const qs = category ? `?category=${category}` : '';
      return request<{ templates: any[] }>('GET', `/projects/templates${qs}`);
    },
    getById: (id: string) => request<{ project: any }>('GET', `/projects/${id}`),
    create: (data: { name: string; description?: string; category?: string; color?: string }) =>
      request<{ project: any }>('POST', '/projects', data),
    update: (id: string, data: any) => request<{ project: any }>('PATCH', `/projects/${id}`, data),
    delete: (id: string) => request('DELETE', `/projects/${id}`),
    archive: (id: string) => request('POST', `/projects/${id}/archive`),
    duplicate: (id: string, name?: string) =>
      request<{ project: any }>('POST', `/projects/${id}/duplicate`, { name }),

    // Graph persistence
    loadGraph: (id: string, snapshotId?: string) => {
      const qs = snapshotId ? `?snapshotId=${snapshotId}` : '';
      return request<{ nodes: any[]; edges: any[]; viewport: any; version: number }>('GET', `/projects/${id}/graph${qs}`);
    },
    saveGraph: (id: string, data: { nodes: any[]; edges: any[]; viewport?: any; label?: string; isCheckpoint?: boolean; isAutosave?: boolean }) =>
      request<{ version: number; snapshotId: string; savedAt: string }>('POST', `/projects/${id}/graph`, data),

    // Version history
    getVersionHistory: (id: string) => request<{ versions: any[] }>('GET', `/projects/${id}/versions`),
    createCheckpoint: (id: string, label: string, description?: string) =>
      request<{ snapshot: any }>('POST', `/projects/${id}/versions/checkpoint`, { label, description }),
    restoreVersion: (id: string, snapshotId: string) =>
      request<{ snapshot: any }>('POST', `/projects/${id}/versions/${snapshotId}/restore`),

    // Export
    export: async (id: string, format: string, projectName?: string): Promise<void> => {
      const res = await fetch(`${BASE}/projects/${id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
        },
        body: JSON.stringify({ format, projectName }),
      });
      if (!res.ok) throw new ApiError('Export failed', 'EXPORT_FAILED', res.status);
      const blob = await res.blob();
      const filename = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? `export.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    },
  },

  // ==========================================
  // Sessions
  // ==========================================
  sessions: {
    getOrCreate: (projectId: string, domain?: string) => {
      const qs = `?projectId=${projectId}${domain ? `&domain=${domain}` : ''}`;
      return request<{ session: any }>('GET', `/sessions${qs}`);
    },
    getById: (id: string) => request<{ session: any }>('GET', `/sessions/${id}`),
    save: (id: string, data: any) => request('PUT', `/sessions/${id}`, data),
    delete: (id: string) => request('DELETE', `/sessions/${id}`),
  },

  // ==========================================
  // Users
  // ==========================================
  users: {
    getPreferences: () => request<{ preferences: any }>('GET', '/users/me/preferences'),
    updatePreferences: (data: any) => request<{ preferences: any }>('PATCH', '/users/me/preferences', data),
    updateProfile: (data: { displayName?: string; bio?: string }) =>
      request<{ user: any }>('PATCH', '/users/me', data),
  },

  // ==========================================
  // Search
  // ==========================================
  search: (q: string, options?: { type?: string; projectId?: string; limit?: number }) => {
    const params = new URLSearchParams({ q, ...options as any });
    return request<{ results: any[]; query: string }>('GET', `/search?${params}`);
  },

  // ==========================================
  // Files
  // ==========================================
  files: {
    upload: async (file: File, projectId?: string, nodeId?: string): Promise<{ file: any }> => {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) formData.append('projectId', projectId);
      if (nodeId) formData.append('nodeId', nodeId);

      const res = await fetch(`${BASE}/files/upload`, {
        method: 'POST',
        headers: _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {},
        body: formData,
      });
      const data: ApiResponse = await res.json();
      if (!res.ok || !data.success) throw new ApiError(data.error?.message ?? 'Upload failed', data.error?.code ?? 'UPLOAD_FAILED', res.status);
      return data.data as { file: any };
    },
    list: (projectId: string) => {
      return request<{ files: any[] }>('GET', `/files?projectId=${projectId}`);
    },
    delete: (id: string) => request('DELETE', `/files/${id}`),
    url: (id: string) => `${BASE}/files/${id}`,
  },

  // Health check
  health: () => request<{ status: string; version: string }>('GET', '/health'),
};
