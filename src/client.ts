import { SamsaraApiError } from './core/errors';
import type {
  HttpMethod,
  MethodForPath,
  OperationFor,
  OperationSuccessBody,
  PathKey,
  RequestConfig,
  RawRequestConfig,
  SamsaraResponse,
} from './core/types';
import { type RequestExecutor } from './core/types';
import { CamerasApi } from './resources/cameras';
import { FleetApi } from './resources/fleet';
import { SafetyApi } from './resources/safety';
import { TachographApi } from './resources/tachograph';

const DEFAULT_BASE_URL = 'https://api.samsara.com';

type NormalizedRequest = {
  path: string;
  method: HttpMethod;
  pathParams?: Record<string, string | number>;
  query?: Record<string, unknown>;
  headers?: HeadersInit;
  body?: BodyInit | Record<string, unknown>;
  contentType?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  baseUrl?: string;
};

interface AbortControllerResult {
  signal?: AbortSignal;
  cleanup?: () => void;
}

export interface SamsaraClientConfig {
  /**
   * Base URL for the Samsara API. Defaults to the public cloud hostname.
   */
  baseUrl?: string;
  /**
   * Static API token or OAuth access token used for `Authorization: Bearer` requests.
   */
  token?: string;
  /**
   * Optional callback that resolves the token right before a request is sent. Takes precedence over `token`.
   */
  getToken?: () => Promise<string> | string;
  /**
   * Override the global `fetch` implementation (useful when targeting Node.js environments).
   */
  fetch?: typeof fetch;
  /**
   * Default timeout applied to every request (in milliseconds).
   */
  timeoutMs?: number;
  /**
   * Headers that should be merged into every request.
   */
  defaultHeaders?: HeadersInit;
}

export class SamsaraClient implements RequestExecutor {
  readonly fleet: FleetApi;
  readonly cameras: CamerasApi;
  readonly safety: SafetyApi;
  readonly tachograph: TachographApi;

  private baseUrl: string;
  private token?: string;
  private readonly getTokenFn?: () => Promise<string> | string;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultHeaders: HeadersInit;
  private readonly defaultTimeout?: number;

  constructor(config: SamsaraClientConfig = {}) {
    this.baseUrl = config.baseUrl?.replace(/\/$/, '') ?? DEFAULT_BASE_URL;
    this.token = config.token;
    this.getTokenFn = config.getToken;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.defaultTimeout = config.timeoutMs;

    const runtimeFetch = config.fetch ?? (globalThis.fetch as typeof fetch | undefined);
    if (!runtimeFetch) {
      throw new Error('No fetch implementation available. Provide one via the `fetch` option.');
    }
    this.fetchImpl = runtimeFetch;

    this.fleet = new FleetApi(this);
    this.cameras = new CamerasApi(this);
    this.safety = new SafetyApi(this);
    this.tachograph = new TachographApi(this);
  }

  setToken(token: string): this {
    this.token = token;
    return this;
  }

  setBaseUrl(baseUrl: string): this {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    return this;
  }

  async request<Path extends PathKey, Method extends MethodForPath<Path>>(
    config: RequestConfig<Path, Method>
  ): Promise<SamsaraResponse<OperationSuccessBody<OperationFor<Path, Method>>>> {
    const response = await this.executeRequest(config);
    return response as SamsaraResponse<OperationSuccessBody<OperationFor<Path, Method>>>;
  }

  async requestRaw(config: RawRequestConfig): Promise<SamsaraResponse<unknown>> {
    return this.executeRequest(config);
  }

  private async executeRequest(
    config: RequestConfig<any, any> | RawRequestConfig
  ): Promise<SamsaraResponse<unknown>> {
    const normalized = this.normalizeConfig(config);
    const url = this.buildUrl(normalized);
    const headers = this.buildHeaders(normalized.headers);

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    const authToken = await this.resolveToken();
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    const body = this.prepareBody(normalized.body, headers, normalized.contentType);
    const timeout = normalized.timeoutMs ?? this.defaultTimeout;
    const { signal, cleanup } = this.createAbortController(normalized.signal, timeout);

    try {
      const response = await this.fetchImpl(url.toString(), {
        method: normalized.method.toUpperCase(),
        headers,
        body,
        signal: signal ?? normalized.signal,
      });

      const data = await this.parseResponse(response);
      if (!response.ok) {
        throw new SamsaraApiError(`Request failed with status ${response.status}`, {
          status: response.status,
          data,
          headers: response.headers,
          requestId: response.headers.get('x-request-id'),
        });
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
        requestId: response.headers.get('x-request-id'),
      };
    } finally {
      cleanup?.();
    }
  }

  private normalizeConfig(config: RequestConfig<any, any> | RawRequestConfig): NormalizedRequest {
    const method = (config.method as string).toLowerCase() as HttpMethod;
    return {
      path: config.path,
      method,
      pathParams: config.pathParams as Record<string, string | number> | undefined,
      query: config.query as Record<string, unknown> | undefined,
      headers: config.headers,
      body: config.body,
      contentType: config.contentType,
      signal: config.signal,
      timeoutMs: config.timeoutMs,
      baseUrl: config.baseUrl,
    };
  }

  private buildUrl({ path, pathParams, query, baseUrl }: NormalizedRequest): URL {
    const resolvedPath = this.interpolatePath(path, pathParams);
    const targetBaseUrl = (baseUrl ?? this.baseUrl) || DEFAULT_BASE_URL;
    const url = new URL(resolvedPath, targetBaseUrl.endsWith('/') ? targetBaseUrl : `${targetBaseUrl}/`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        this.appendQuery(url.searchParams, key, value);
      });
    }

    return url;
  }

  private interpolatePath(path: string, pathParams?: Record<string, string | number>): string {
    const missing: string[] = [];
    const resolved = path.replace(/\{([^}]+)\}/g, (_, key) => {
      const value = pathParams?.[key];
      if (value === undefined || value === null) {
        missing.push(key);
        return '';
      }
      return encodeURIComponent(String(value));
    });

    if (missing.length > 0) {
      throw new Error(`Missing path parameters: ${missing.join(', ')}`);
    }

    return resolved;
  }

  private appendQuery(params: URLSearchParams, key: string, value: unknown): void {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => this.appendQuery(params, key, entry));
      return;
    }

    if (value instanceof Date) {
      params.append(key, value.toISOString());
      return;
    }

    if (typeof value === 'object') {
      params.append(key, JSON.stringify(value));
      return;
    }

    params.append(key, String(value));
  }

  private buildHeaders(extra?: HeadersInit): Headers {
    const headers = new Headers(this.defaultHeaders);

    if (extra) {
      new Headers(extra).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    return headers;
  }

  private prepareBody(
    body: NormalizedRequest['body'],
    headers: Headers,
    explicitContentType?: string
  ): BodyInit | undefined {
    if (body === undefined || body === null) {
      if (explicitContentType) {
        headers.set('Content-Type', explicitContentType);
      }
      return undefined;
    }

    if (this.isBodyInit(body)) {
      if (explicitContentType) {
        headers.set('Content-Type', explicitContentType);
      }
      return body;
    }

    headers.set('Content-Type', explicitContentType ?? 'application/json');
    return JSON.stringify(body);
  }

  private isBodyInit(value: unknown): value is BodyInit {
    if (value == null) {
      return false;
    }

    if (typeof value === 'string' || value instanceof ArrayBuffer) {
      return true;
    }

    if (ArrayBuffer.isView(value)) {
      return true;
    }

    const globalFormData = (globalThis as { FormData?: typeof FormData }).FormData;
    if (globalFormData && value instanceof globalFormData) {
      return true;
    }

    const globalBlob = (globalThis as { Blob?: typeof Blob }).Blob;
    if (globalBlob && value instanceof globalBlob) {
      return true;
    }

    const globalURLSearchParams = (globalThis as { URLSearchParams?: typeof URLSearchParams }).URLSearchParams;
    if (globalURLSearchParams && value instanceof globalURLSearchParams) {
      return true;
    }

    const globalReadableStream = (globalThis as { ReadableStream?: typeof ReadableStream }).ReadableStream;
    if (globalReadableStream && value instanceof globalReadableStream) {
      return true;
    }

    return false;
  }

  private createAbortController(signal?: AbortSignal, timeoutMs?: number): AbortControllerResult {
    if (!signal && !timeoutMs) {
      return { signal: undefined, cleanup: undefined };
    }

    if (!timeoutMs) {
      return { signal, cleanup: undefined };
    }

    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const abort = (reason?: unknown) => {
      if (!controller.signal.aborted) {
        controller.abort(reason);
      }
    };

    if (signal) {
      if (signal.aborted) {
        abort(signal.reason);
      } else {
        const listener = () => abort(signal.reason);
        signal.addEventListener('abort', listener, { once: true });
        timeoutId = setTimeout(() => abort(this.createTimeoutReason()), timeoutMs);
        return {
          signal: controller.signal,
          cleanup: () => {
            signal.removeEventListener('abort', listener);
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          },
        };
      }
    }

    timeoutId = setTimeout(() => abort(this.createTimeoutReason()), timeoutMs);
    return {
      signal: controller.signal,
      cleanup: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      },
    };
  }

  private createTimeoutReason(): Error {
    if (typeof DOMException !== 'undefined') {
      return new DOMException('Request timed out', 'AbortError');
    }
    const error = new Error('Request timed out');
    (error as Error & { name?: string }).name = 'AbortError';
    return error;
  }

  private async resolveToken(): Promise<string | undefined> {
    if (this.getTokenFn) {
      const result = await this.getTokenFn();
      if (result) {
        return result;
      }
    }
    return this.token;
  }

  private async parseResponse(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return undefined;
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return undefined;
    }

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

    if (contentType.includes('application/json') || contentType.includes('+json')) {
      const text = await response.text();
      if (!text) {
        return undefined;
      }
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }

    if (contentType.startsWith('text/')) {
      return response.text();
    }

    if (!contentType) {
      const text = await response.text();
      return text.length ? text : undefined;
    }

    return response.arrayBuffer();
  }
}
