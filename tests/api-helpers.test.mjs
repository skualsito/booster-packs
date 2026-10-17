import assert from "node:assert/strict";
import test from "node:test";
import {
  UPGRADER_MAX_CHANCE,
  rollPercent,
  upgraderChance,
  weightedPick,
} from "../server/lib/game-math.mjs";
import {
  clientIp,
  createRateLimiter,
  createSessionToken,
  hashPassword,
  hashSessionToken,
  isCsrfSafe,
  parseCookies,
  serializeSessionCookie,
  verifyPassword,
} from "../server/lib/security.mjs";

test("weightedPick maps each roll to the right slot", () => {
  const items = [
    { id: "common", probability: 70 },
    { id: "rare", probability: 29.5 },
    { id: "secret", probability: 0.5 },
  ];
  // Weights in thousandths: 70000, 29500, 500 (total 100000).
  const pickWith = (roll) => weightedPick(items, () => roll).id;

  assert.equal(pickWith(0), "common");
  assert.equal(pickWith(69999), "common");
  assert.equal(pickWith(70000), "rare");
  assert.equal(pickWith(99499), "rare");
  assert.equal(pickWith(99500), "secret");
  assert.equal(pickWith(99999), "secret");
});

test("weightedPick never picks zero or negative probabilities", () => {
  const items = [
    { id: "never", probability: 0 },
    { id: "broken", probability: -5 },
    { id: "always", probability: 1 },
  ];

  for (let index = 0; index < 200; index += 1) {
    assert.equal(weightedPick(items).id, "always");
  }
});

test("weightedPick distribution roughly matches probabilities", () => {
  const items = [
    { id: "a", probability: 80 },
    { id: "b", probability: 20 },
  ];
  let aCount = 0;
  const runs = 20000;

  for (let index = 0; index < runs; index += 1) {
    if (weightedPick(items).id === "a") aCount += 1;
  }

  assert.ok(Math.abs(aCount / runs - 0.8) < 0.02, `a ratio ${aCount / runs}`);
});

test("upgraderChance applies RTP and caps", () => {
  assert.equal(upgraderChance(0, 10), 0);
  assert.equal(upgraderChance(10, 10), 0);
  assert.equal(upgraderChance(10, 5), 0);
  assert.equal(upgraderChance(10, 100), 9);
  assert.equal(upgraderChance(99, 100), UPGRADER_MAX_CHANCE);
});

test("rollPercent stays within [0, 100)", () => {
  assert.equal(rollPercent(() => 0), 0);
  assert.equal(rollPercent(() => 99_999_999), 99.999999);
});

test("password hashing round-trips and rejects wrong passwords", async () => {
  const { salt, passwordHash } = await hashPassword("correct horse");

  assert.equal(await verifyPassword("correct horse", salt, passwordHash), true);
  assert.equal(await verifyPassword("wrong horse", salt, passwordHash), false);
  assert.equal(await verifyPassword("correct horse", salt, ""), false);
});

test("session tokens are random and stored hashed", () => {
  const token = createSessionToken();

  assert.match(token, /^[a-f0-9]{64}$/);
  assert.notEqual(token, createSessionToken());
  assert.notEqual(hashSessionToken(token), token);
  assert.equal(hashSessionToken(token), hashSessionToken(token));
});

test("rate limiter blocks after the limit and resets after the window", () => {
  let now = 0;
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now });

  assert.equal(limiter.consume("ip").allowed, true);
  assert.equal(limiter.consume("ip").allowed, true);
  assert.equal(limiter.consume("ip").allowed, false);
  assert.equal(limiter.consume("other").allowed, true);

  now = 1000;
  assert.equal(limiter.consume("ip").allowed, true);

  limiter.consume("ip");
  limiter.reset("ip");
  assert.equal(limiter.consume("ip").allowed, true);
});

test("clientIp only trusts proxy headers from loopback", () => {
  const request = (remoteAddress, headers = {}) => ({
    socket: { remoteAddress },
    headers,
  });

  assert.equal(
    clientIp(request("127.0.0.1", { "x-real-ip": "203.0.113.7" })),
    "203.0.113.7",
  );
  assert.equal(
    clientIp(request("::1", { "x-forwarded-for": "198.51.100.2, 10.0.0.1" })),
    "198.51.100.2",
  );
  assert.equal(
    clientIp(request("203.0.113.9", { "x-real-ip": "1.2.3.4" })),
    "203.0.113.9",
  );
});

test("parseCookies reads values and ignores malformed parts", () => {
  assert.deepEqual(parseCookies("a=1; pullario_session=abc%20d; junk; b=%E0"), {
    a: "1",
    pullario_session: "abc d",
  });
  assert.deepEqual(parseCookies(undefined), {});
});

test("serializeSessionCookie is HttpOnly, Lax and optionally scoped", () => {
  assert.equal(
    serializeSessionCookie("s", "tok", {
      maxAgeMs: 8 * 60 * 60 * 1000,
      domain: ".pullario.juanalmada.com",
    }),
    "s=tok; Path=/; Max-Age=28800; HttpOnly; SameSite=Lax; Secure; Domain=.pullario.juanalmada.com",
  );
  assert.equal(
    serializeSessionCookie("s", "", { maxAgeMs: 0, secure: false }),
    "s=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
  );
});

test("isCsrfSafe only lets allowed origins mutate", () => {
  const allowed = ["https://pullario.juanalmada.com"];
  const request = (method, headers = {}) => ({ method, headers });

  assert.equal(isCsrfSafe(request("GET", { origin: "https://evil.test" }), allowed, "s"), true);
  assert.equal(
    isCsrfSafe(request("POST", { origin: "https://pullario.juanalmada.com" }), allowed, "s"),
    true,
  );
  assert.equal(isCsrfSafe(request("POST", { origin: "https://evil.test" }), allowed, "s"), false);
  assert.equal(isCsrfSafe(request("DELETE", { origin: "null" }), allowed, "s"), false);
  // No Origin: refuse when the session cookie would ride along, allow otherwise.
  assert.equal(isCsrfSafe(request("POST", { cookie: "s=tok" }), allowed, "s"), false);
  assert.equal(isCsrfSafe(request("POST", { authorization: "Bearer x" }), allowed, "s"), true);
});
