import type { SessionAuth } from "./types";

export const AUTH_STORAGE_KEY = "pullario-session-v1";
export const LEGACY_AUTH_STORAGE_KEY = "hitshelf-session-v1";
export const LOCAL_API_BASE = (
  process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:3004"
).replace(/\/$/, "");

export const localApiUrl = (path: string) => `${LOCAL_API_BASE}${path}`;

export const parseSessionAuth = (raw: string | null): SessionAuth | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SessionAuth;
    return parsed?.token &&
      parsed?.username &&
      (parsed.role === "user" || parsed.role === "admin")
      ? parsed
      : null;
  } catch {
    return null;
  }
};

// All calls to the local API go through here, so auth transport (header,
// cookie, base URL) can change in one place.
export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(localApiUrl(path), init);

export const authHeader = (session: Pick<SessionAuth, "token">) => ({
  Authorization: `Bearer ${session.token}`,
});

export const readStoredSession = () =>
  parseSessionAuth(
    localStorage.getItem(AUTH_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_AUTH_STORAGE_KEY),
  );

export const saveStoredSession = (session: SessionAuth) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const clearLegacyStoredSession = () => {
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
};
