import { networkError, normalizeApiError } from "./errors";

const baseUrl = import.meta.env.VITE_API_URL ?? "/api";

/**
 * Orval mutator: every generated request goes through here so the base URL is
 * configurable. In dev, "/api" is proxied to http://localhost:8080 by Vite.
 * In production, VITE_API_URL is the absolute Render URL.
 *
 * Regenerate the typed client after API changes:
 *   cd web/apps/web && bun run gen:api
 * (the API must be running on http://localhost:8080)
 *
 * Orval 8's fetch client expects the `{ data, status, headers }` envelope.
 */
export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${url}`, { ...options, headers });
  } catch (cause) {
    throw networkError(cause);
  }

  const body = await readBody(response);

  if (!response.ok) {
    throw normalizeApiError(response.status, body, response.headers);
  }

  return { data: body, status: response.status, headers: response.headers } as T;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text.length > 0 ? text : null;
}
