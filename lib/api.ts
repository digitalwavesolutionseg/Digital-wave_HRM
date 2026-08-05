const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const ACCESS_KEY = "dw_hrm_access";
const REFRESH_KEY = "dw_hrm_refresh";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function extractMessage(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  const p = payload as { message?: unknown };
  if (Array.isArray(p.message)) {
    const parts = (p.message as unknown[])
      .map((m) => (typeof m === "string" ? m : (m as { message?: string })?.message))
      .filter((m): m is string => Boolean(m));
    if (parts.length) return parts.join(", ");
  }
  if (typeof p.message === "string") return p.message;
  return null;
}

function getErrorMessage(payload: unknown, status: number): string {
  const fallback = status >= 500 ? "Server error. Please try again." : "Request failed.";
  return extractMessage(payload) ?? fallback;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry && typeof window !== "undefined") {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
  }

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(res.status, getErrorMessage(payload, res.status));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get<T>(path: string, options?: RequestInit) {
    return request<T>(path, { method: "GET", ...options });
  },
  post<T>(path: string, body?: unknown, options?: RequestInit) {
    return request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
      ...options,
    });
  },
  put<T>(path: string, body?: unknown, options?: RequestInit) {
    return request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
      ...options,
    });
  },
  patch<T>(path: string, body?: unknown, options?: RequestInit) {
    return request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
      ...options,
    });
  },
  del<T>(path: string, options?: RequestInit) {
    return request<T>(path, { method: "DELETE", ...options });
  },
};

export { getErrorMessage };