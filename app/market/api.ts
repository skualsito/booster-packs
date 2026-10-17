// Pre-cookie builds kept the session token here; read once to migrate, then wiped.
const LEGACY_AUTH_STORAGE_KEYS = ["pullario-session-v1", "hitshelf-session-v1"];

export const LOCAL_API_BASE = (
  process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:3004"
).replace(/\/$/, "");

export const localApiUrl = (path: string) => `${LOCAL_API_BASE}${path}`;

// All calls to the local API go through here. The session lives in an
// HttpOnly cookie set by the API, so every call sends credentials and the
// token is never readable from JS.
export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(localApiUrl(path), { ...init, credentials: "include" });

export const takeLegacySessionToken = () => {
  try {
    let token: string | undefined;

    for (const key of LEGACY_AUTH_STORAGE_KEYS) {
      const parsed = JSON.parse(localStorage.getItem(key) ?? "null") as {
        token?: unknown;
      } | null;
      token ??= typeof parsed?.token === "string" ? parsed.token : undefined;
      localStorage.removeItem(key);
    }

    return token;
  } catch {
    return undefined;
  }
};
