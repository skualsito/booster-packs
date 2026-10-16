import {
  createHash,
  pbkdf2,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);

export const PASSWORD_MIN_LENGTH = 8;

export async function hashPassword(
  password,
  salt = randomBytes(16).toString("hex"),
) {
  const derived = await pbkdf2Async(password, salt, 120000, 64, "sha512");

  return { salt, passwordHash: derived.toString("hex") };
}

export async function verifyPassword(password, salt, expectedHash) {
  const { passwordHash } = await hashPassword(password, salt);
  const actual = Buffer.from(passwordHash, "hex");
  const expected = Buffer.from(expectedHash ?? "", "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

// Only the hash is stored, so a leaked sessions table can't be replayed.
export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// Fixed-window limiter kept in memory; good enough for a single API process.
export function createRateLimiter({ limit, windowMs, now = Date.now }) {
  const hits = new Map();

  function sweep(currentTime) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= currentTime) {
        hits.delete(key);
      }
    }
  }

  return {
    consume(key) {
      const currentTime = now();

      if (hits.size > 10000) {
        sweep(currentTime);
      }

      const entry = hits.get(key);

      if (!entry || entry.resetAt <= currentTime) {
        hits.set(key, { count: 1, resetAt: currentTime + windowMs });
        return { allowed: true, retryAfterMs: 0 };
      }

      entry.count += 1;

      return entry.count > limit
        ? { allowed: false, retryAfterMs: entry.resetAt - currentTime }
        : { allowed: true, retryAfterMs: 0 };
    },
    reset(key) {
      hits.delete(key);
    },
  };
}

const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

// Proxy headers are trusted only when the request comes from a local proxy
// (Nginx in production); otherwise any client could spoof them.
export function clientIp(request) {
  const remote = request.socket?.remoteAddress ?? "";

  if (!LOOPBACK_ADDRESSES.has(remote)) {
    return remote;
  }

  const realIp = request.headers["x-real-ip"];

  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim();
  }

  const forwarded = request.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return remote;
}
