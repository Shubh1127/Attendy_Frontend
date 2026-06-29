import { env } from "./env";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** multipart/form-data payload — use for face/voice file uploads */
  formData?: FormData;
  token?: string;
  signal?: AbortSignal;
  /** Aborts the request if the backend hangs (ms). Defaults to 20s, longer for biometric calls. */
  timeoutMs?: number;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20_000);
  const signal = opts.signal ?? controller.signal;

  try {
    const headers: HeadersInit = {};
    if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
    if (!opts.formData) headers["Content-Type"] = "application/json";

    const res = await fetch(`${env.apiBaseUrl}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.formData ?? (opts.body ? JSON.stringify(opts.body) : undefined),
      signal,
    });

    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : null;

    if (!res.ok) {
      const message =
    (payload &&
        (
            payload.detail ||
            payload.message ||
            payload.error
        )) ||
    `Request failed with status ${res.status}`;
      return { ok: false, error: new ApiError(message, res.status, payload?.code) };
    }

    return { ok: true, data: payload as T };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        ok: false,
        error: new ApiError("The backend took too long to respond. Try again.", 408, "timeout"),
      };
    }
    return {
      ok: false,
      error: new ApiError(
        err instanceof Error ? err.message : "Couldn't reach the server. Check your connection.",
        0,
        "network"
      ),
    };
  }
}

export const apiClient = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body" | "formData">) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "POST", body }),
  postForm: <T>(path: string, formData: FormData, opts?: Omit<RequestOptions, "method" | "formData">) =>
    request<T>(path, { ...opts, method: "POST", formData }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};
