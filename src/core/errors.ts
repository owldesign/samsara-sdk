export interface ApiErrorOptions<T = unknown> {
  status: number;
  data?: T;
  headers?: Headers;
  requestId?: string | null;
  cause?: unknown;
}

export class SamsaraApiError<T = unknown> extends Error {
  readonly status: number;
  readonly data?: T;
  readonly headers: Headers;
  readonly requestId?: string | null;

  constructor(message: string, { status, data, headers, requestId, cause }: ApiErrorOptions<T>) {
    super(message);
    this.name = 'SamsaraApiError';
    this.status = status;
    this.data = data;
    this.headers = headers ?? new Headers();
    this.requestId = requestId ?? null;

    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, SamsaraApiError);
    }
  }
}

export const isSamsaraApiError = (error: unknown): error is SamsaraApiError =>
  error instanceof SamsaraApiError;
