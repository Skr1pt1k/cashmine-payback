import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/lib/config';

export type ApiErrorCode =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'IDEMPOTENCY_MISMATCH'
  | 'RATE_LIMITED'
  | 'SERVER'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number | null,
    public readonly field?: string,
    public readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** For writes: the server may or may not have applied the request. */
  get isOutcomeUnknown(): boolean {
    return this.code === 'TIMEOUT' || this.code === 'NETWORK' || this.code === 'SERVER';
  }

  get isRetryable(): boolean {
    return this.isOutcomeUnknown || this.code === 'RATE_LIMITED';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
};

let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureApiClient(config: { getToken: () => string | null; onUnauthorized: () => void }) {
  getToken = config.getToken;
  onUnauthorized = config.onUnauthorized;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    const timedOut = controller.signal.aborted;
    throw new ApiError(
      timedOut ? 'TIMEOUT' : 'NETWORK',
      timedOut ? 'The request timed out' : 'Network error. Check your connection.',
      null,
    );
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data?.error;
    const retryAfterHeader = Number(response.headers.get('Retry-After'));
    const apiError = new ApiError(
      (error?.code as ApiErrorCode) ?? (response.status >= 500 ? 'SERVER' : 'UNKNOWN'),
      error?.message ?? `Request failed (${response.status})`,
      response.status,
      error?.field,
      error?.retryAfterMs ?? (retryAfterHeader ? retryAfterHeader * 1000 : undefined),
    );
    if (apiError.code === 'UNAUTHORIZED') onUnauthorized();
    throw apiError;
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'POST', body, headers }),
};

export type ApiClient = typeof apiClient;
