// src/core/errors.ts
var SamsaraApiError = class _SamsaraApiError extends Error {
  constructor(message, { status, data, headers, requestId, cause }) {
    super(message);
    this.name = "SamsaraApiError";
    this.status = status;
    this.data = data;
    this.headers = headers ?? new Headers();
    this.requestId = requestId ?? null;
    if (cause !== void 0) {
      this.cause = cause;
    }
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, _SamsaraApiError);
    }
  }
};
var isSamsaraApiError = (error) => error instanceof SamsaraApiError;

// src/resources/cameras.ts
var CamerasApi = class {
  constructor(executor) {
    this.executor = executor;
  }
  listMedia(options) {
    return this.executor.request({
      path: "/cameras/media",
      method: "get",
      ...options ?? {}
    });
  }
  getMediaRetrieval(options) {
    return this.executor.request({
      path: "/cameras/media/retrieval",
      method: "get",
      ...options ?? {}
    });
  }
  createMediaRetrieval(body, options) {
    return this.executor.request({
      path: "/cameras/media/retrieval",
      method: "post",
      ...options ?? {},
      body
    });
  }
};

// src/resources/helpers.ts
var toPathParam = (value) => String(value);

// src/resources/fleet.ts
var FleetApi = class {
  constructor(executor) {
    this.executor = executor;
  }
  listVehicles(options) {
    return this.executor.request({
      path: "/fleet/vehicles",
      method: "get",
      ...options ?? {}
    });
  }
  getVehicle(vehicleId, options) {
    return this.executor.request({
      path: "/fleet/vehicles/{id}",
      method: "get",
      ...options ?? {},
      pathParams: { id: toPathParam(vehicleId) }
    });
  }
  updateVehicle(vehicleId, body, options) {
    return this.executor.request({
      path: "/fleet/vehicles/{id}",
      method: "patch",
      ...options ?? {},
      pathParams: { id: toPathParam(vehicleId) },
      body
    });
  }
  listDrivers(options) {
    return this.executor.request({
      path: "/fleet/drivers",
      method: "get",
      ...options ?? {}
    });
  }
  createDriver(body, options) {
    return this.executor.request({
      path: "/fleet/drivers",
      method: "post",
      ...options ?? {},
      body
    });
  }
  getDriver(driverId, options) {
    return this.executor.request({
      path: "/fleet/drivers/{id}",
      method: "get",
      ...options ?? {},
      pathParams: { id: toPathParam(driverId) }
    });
  }
  updateDriver(driverId, body, options) {
    return this.executor.request({
      path: "/fleet/drivers/{id}",
      method: "patch",
      ...options ?? {},
      pathParams: { id: toPathParam(driverId) },
      body
    });
  }
  listDriverVehicleAssignments(options) {
    return this.executor.request({
      path: "/fleet/driver-vehicle-assignments",
      method: "get",
      ...options ?? {}
    });
  }
  getVehicleStats(options) {
    return this.executor.request({
      path: "/fleet/vehicles/stats",
      method: "get",
      ...options ?? {}
    });
  }
  getVehicleLocations(options) {
    return this.executor.request({
      path: "/fleet/vehicles/locations",
      method: "get",
      ...options ?? {}
    });
  }
  listDocuments(options) {
    return this.executor.request({
      path: "/fleet/documents",
      method: "get",
      ...options ?? {}
    });
  }
  createDocument(body, options) {
    return this.executor.request({
      path: "/fleet/documents",
      method: "post",
      ...options ?? {},
      body
    });
  }
  getDocument(documentId, options) {
    return this.executor.request({
      path: "/fleet/documents/{id}",
      method: "get",
      ...options ?? {},
      pathParams: { id: toPathParam(documentId) }
    });
  }
  deleteDocument(documentId, options) {
    return this.executor.request({
      path: "/fleet/documents/{id}",
      method: "delete",
      ...options ?? {},
      pathParams: { id: toPathParam(documentId) }
    });
  }
};

// src/resources/safety.ts
var SafetyApi = class {
  constructor(executor) {
    this.executor = executor;
  }
  listEvents(options) {
    return this.executor.request({
      path: "/safety-events",
      method: "get",
      ...options ?? {}
    });
  }
  streamEvents(options) {
    return this.executor.request({
      path: "/safety-events/stream",
      method: "get",
      ...options ?? {}
    });
  }
  listDriverScores(options) {
    return this.executor.request({
      path: "/safety-scores/drivers",
      method: "get",
      ...options ?? {}
    });
  }
  listDriverTripScores(options) {
    return this.executor.request({
      path: "/safety-scores/drivers/trips",
      method: "get",
      ...options ?? {}
    });
  }
  listTagGroupScores(options) {
    return this.executor.request({
      path: "/safety-scores/tag-group",
      method: "get",
      ...options ?? {}
    });
  }
  listTagScores(options) {
    return this.executor.request({
      path: "/safety-scores/tags",
      method: "get",
      ...options ?? {}
    });
  }
  listVehicleScores(options) {
    return this.executor.request({
      path: "/safety-scores/vehicles",
      method: "get",
      ...options ?? {}
    });
  }
  listVehicleTripScores(options) {
    return this.executor.request({
      path: "/safety-scores/vehicles/trips",
      method: "get",
      ...options ?? {}
    });
  }
  streamDetections(options) {
    return this.executor.request({
      path: "/detections/stream",
      method: "get",
      ...options ?? {}
    });
  }
};

// src/resources/tachograph.ts
var TachographApi = class {
  constructor(executor) {
    this.executor = executor;
  }
  listDriverActivity(options) {
    return this.executor.request({
      path: "/fleet/drivers/tachograph-activity/history",
      method: "get",
      ...options ?? {}
    });
  }
  listDriverFiles(options) {
    return this.executor.request({
      path: "/fleet/drivers/tachograph-files/history",
      method: "get",
      ...options ?? {}
    });
  }
  listVehicleFiles(options) {
    return this.executor.request({
      path: "/fleet/vehicles/tachograph-files/history",
      method: "get",
      ...options ?? {}
    });
  }
};

// src/client.ts
var DEFAULT_BASE_URL = "https://api.samsara.com";
var SamsaraClient = class {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl?.replace(/\/$/, "") ?? DEFAULT_BASE_URL;
    this.token = config.token;
    this.getTokenFn = config.getToken;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.defaultTimeout = config.timeoutMs;
    const runtimeFetch = config.fetch ?? globalThis.fetch;
    if (!runtimeFetch) {
      throw new Error("No fetch implementation available. Provide one via the `fetch` option.");
    }
    this.fetchImpl = runtimeFetch;
    this.fleet = new FleetApi(this);
    this.cameras = new CamerasApi(this);
    this.safety = new SafetyApi(this);
    this.tachograph = new TachographApi(this);
  }
  setToken(token) {
    this.token = token;
    return this;
  }
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    return this;
  }
  async request(config) {
    const response = await this.executeRequest(config);
    return response;
  }
  async requestRaw(config) {
    return this.executeRequest(config);
  }
  async executeRequest(config) {
    const normalized = this.normalizeConfig(config);
    const url = this.buildUrl(normalized);
    const headers = this.buildHeaders(normalized.headers);
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    const authToken = await this.resolveToken();
    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }
    const body = this.prepareBody(normalized.body, headers, normalized.contentType);
    const timeout = normalized.timeoutMs ?? this.defaultTimeout;
    const { signal, cleanup } = this.createAbortController(normalized.signal, timeout);
    try {
      const response = await this.fetchImpl(url.toString(), {
        method: normalized.method.toUpperCase(),
        headers,
        body,
        signal: signal ?? normalized.signal
      });
      const data = await this.parseResponse(response);
      if (!response.ok) {
        throw new SamsaraApiError(`Request failed with status ${response.status}`, {
          status: response.status,
          data,
          headers: response.headers,
          requestId: response.headers.get("x-request-id")
        });
      }
      return {
        data,
        status: response.status,
        headers: response.headers,
        requestId: response.headers.get("x-request-id")
      };
    } finally {
      cleanup?.();
    }
  }
  normalizeConfig(config) {
    const method = config.method.toLowerCase();
    return {
      path: config.path,
      method,
      pathParams: config.pathParams,
      query: config.query,
      headers: config.headers,
      body: config.body,
      contentType: config.contentType,
      signal: config.signal,
      timeoutMs: config.timeoutMs,
      baseUrl: config.baseUrl
    };
  }
  buildUrl({ path, pathParams, query, baseUrl }) {
    const resolvedPath = this.interpolatePath(path, pathParams);
    const targetBaseUrl = (baseUrl ?? this.baseUrl) || DEFAULT_BASE_URL;
    const url = new URL(resolvedPath, targetBaseUrl.endsWith("/") ? targetBaseUrl : `${targetBaseUrl}/`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        this.appendQuery(url.searchParams, key, value);
      });
    }
    return url;
  }
  interpolatePath(path, pathParams) {
    const missing = [];
    const resolved = path.replace(/\{([^}]+)\}/g, (_, key) => {
      const value = pathParams?.[key];
      if (value === void 0 || value === null) {
        missing.push(key);
        return "";
      }
      return encodeURIComponent(String(value));
    });
    if (missing.length > 0) {
      throw new Error(`Missing path parameters: ${missing.join(", ")}`);
    }
    return resolved;
  }
  appendQuery(params, key, value) {
    if (value === void 0 || value === null) {
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
    if (typeof value === "object") {
      params.append(key, JSON.stringify(value));
      return;
    }
    params.append(key, String(value));
  }
  buildHeaders(extra) {
    const headers = new Headers(this.defaultHeaders);
    if (extra) {
      new Headers(extra).forEach((value, key) => {
        headers.set(key, value);
      });
    }
    return headers;
  }
  prepareBody(body, headers, explicitContentType) {
    if (body === void 0 || body === null) {
      if (explicitContentType) {
        headers.set("Content-Type", explicitContentType);
      }
      return void 0;
    }
    if (this.isBodyInit(body)) {
      if (explicitContentType) {
        headers.set("Content-Type", explicitContentType);
      }
      return body;
    }
    headers.set("Content-Type", explicitContentType ?? "application/json");
    return JSON.stringify(body);
  }
  isBodyInit(value) {
    if (value == null) {
      return false;
    }
    if (typeof value === "string" || value instanceof ArrayBuffer) {
      return true;
    }
    if (ArrayBuffer.isView(value)) {
      return true;
    }
    const globalFormData = globalThis.FormData;
    if (globalFormData && value instanceof globalFormData) {
      return true;
    }
    const globalBlob = globalThis.Blob;
    if (globalBlob && value instanceof globalBlob) {
      return true;
    }
    const globalURLSearchParams = globalThis.URLSearchParams;
    if (globalURLSearchParams && value instanceof globalURLSearchParams) {
      return true;
    }
    const globalReadableStream = globalThis.ReadableStream;
    if (globalReadableStream && value instanceof globalReadableStream) {
      return true;
    }
    return false;
  }
  createAbortController(signal, timeoutMs) {
    if (!signal && !timeoutMs) {
      return { signal: void 0, cleanup: void 0 };
    }
    if (!timeoutMs) {
      return { signal, cleanup: void 0 };
    }
    const controller = new AbortController();
    let timeoutId;
    const abort = (reason) => {
      if (!controller.signal.aborted) {
        controller.abort(reason);
      }
    };
    if (signal) {
      if (signal.aborted) {
        abort(signal.reason);
      } else {
        const listener = () => abort(signal.reason);
        signal.addEventListener("abort", listener, { once: true });
        timeoutId = setTimeout(() => abort(this.createTimeoutReason()), timeoutMs);
        return {
          signal: controller.signal,
          cleanup: () => {
            signal.removeEventListener("abort", listener);
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          }
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
      }
    };
  }
  createTimeoutReason() {
    if (typeof DOMException !== "undefined") {
      return new DOMException("Request timed out", "AbortError");
    }
    const error = new Error("Request timed out");
    error.name = "AbortError";
    return error;
  }
  async resolveToken() {
    if (this.getTokenFn) {
      const result = await this.getTokenFn();
      if (result) {
        return result;
      }
    }
    return this.token;
  }
  async parseResponse(response) {
    if (response.status === 204) {
      return void 0;
    }
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return void 0;
    }
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (contentType.includes("application/json") || contentType.includes("+json")) {
      const text = await response.text();
      if (!text) {
        return void 0;
      }
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
    if (contentType.startsWith("text/")) {
      return response.text();
    }
    if (!contentType) {
      const text = await response.text();
      return text.length ? text : void 0;
    }
    return response.arrayBuffer();
  }
};
export {
  CamerasApi,
  FleetApi,
  SafetyApi,
  SamsaraApiError,
  SamsaraClient,
  TachographApi,
  isSamsaraApiError
};
//# sourceMappingURL=index.mjs.map