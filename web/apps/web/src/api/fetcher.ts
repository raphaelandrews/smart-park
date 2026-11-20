const baseUrl = import.meta.env.VITE_API_URL ?? "/api";

/**
 * Orval mutator: every generated request goes through here so the base URL is
 * configurable. In dev, "/api" is proxied to http://localhost:8080 by Vite.
 * In production, VITE_API_URL is the absolute Render URL.
 *
 * Orval 8's fetch client expects the `{ data, status, headers }` envelope.
 */
export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${url}`, { ...options, headers });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed with status ${response.status}`);
  }

  const data = response.status === 204 ? undefined : await response.json();
  return { data, status: response.status, headers: response.headers } as T;
}
