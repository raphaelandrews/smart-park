const TOKEN_KEY = "smartpark.accessToken";

export const AUTH_UNAUTHORIZED_EVENT = "smartpark:auth-unauthorized";

let memoryToken: string | null = readStoredToken();

function readStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return memoryToken;
}

export function setAccessToken(token: string | null) {
  memoryToken = token;
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Storage may be unavailable; the in-memory token still works for this page.
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}

export function hasAccessToken(): boolean {
  return Boolean(memoryToken);
}

export function notifyUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
  }
}
