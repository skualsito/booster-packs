import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import {
  UPGRADER_MAX_CHANCE,
  UPGRADER_RTP,
  rollPercent,
  upgraderChance,
  weightedPick,
} from "./lib/game-math.mjs";
import {
  PASSWORD_MIN_LENGTH,
  clientIp,
  createRateLimiter,
  createSessionToken,
  hashPassword,
  hashSessionToken,
  isCsrfSafe,
  parseCookies,
  serializeSessionCookie,
  verifyPassword,
} from "./lib/security.mjs";

const ROOT_DIR = process.cwd();
const ENV_PATH = resolve(ROOT_DIR, ".env.local");
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;
// Sliding expiry is only written back once this much of the TTL has passed.
const TOKEN_REFRESH_MS = 1000 * 60 * 15;
const loginLimiter = createRateLimiter({ limit: 10, windowMs: 1000 * 60 * 15 });
const registerLimiter = createRateLimiter({ limit: 5, windowMs: 1000 * 60 * 60 });

loadEnvFile(ENV_PATH);

const config = {
  host: process.env.LOCAL_API_HOST ?? "127.0.0.1",
  port: Number(process.env.LOCAL_API_PORT ?? 3004),
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3003")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  mysqlHost: process.env.MYSQL_HOST ?? "127.0.0.1",
  mysqlPort: Number(process.env.MYSQL_PORT ?? 3306),
  mysqlUser: process.env.MYSQL_USER ?? "root",
  mysqlPassword: process.env.MYSQL_PASSWORD ?? "",
  mysqlDatabase: process.env.MYSQL_DATABASE ?? "hitshelf",
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  sessionCookieName: process.env.SESSION_COOKIE_NAME || "pullario_session",
  // e.g. ".pullario.juanalmada.com" so web and API subdomains share it; empty
  // means a host-only cookie on the API host.
  sessionCookieDomain: process.env.SESSION_COOKIE_DOMAIN?.trim() || undefined,
  // Browsers accept Secure cookies on http://localhost, so this stays on locally.
  sessionCookieSecure: process.env.SESSION_COOKIE_SECURE !== "false",
};

if (!config.adminPassword) {
  console.error("Configura ADMIN_PASSWORD en .env.local antes de iniciar el API.");
  process.exit(1);
}

if (config.adminPassword.length < PASSWORD_MIN_LENGTH) {
  console.warn(
    `ADMIN_PASSWORD tiene menos de ${PASSWORD_MIN_LENGTH} caracteres; usa una mas larga.`,
  );
}

let pool;

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function databaseName() {
  if (!/^[a-zA-Z0-9_$]+$/.test(config.mysqlDatabase)) {
    throw new Error("MYSQL_DATABASE solo puede contener letras, numeros, _ o $.");
  }

  return config.mysqlDatabase;
}

async function getPool() {
  if (pool) {
    return pool;
  }

  const database = databaseName();
  const setupConnection = await mysql.createConnection({
    host: config.mysqlHost,
    port: config.mysqlPort,
    user: config.mysqlUser,
    password: config.mysqlPassword,
  });

  await setupConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await setupConnection.end();

  const nextPool = mysql.createPool({
    host: config.mysqlHost,
    port: config.mysqlPort,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database,
    connectionLimit: 10,
    namedPlaceholders: false,
    timezone: "Z",
  });

  try {
    await migrate(nextPool);
    await seedAdmin(nextPool);
    pool = nextPool;
  } catch (error) {
    await nextPool.end();
    throw error;
  }

  return pool;
}

async function migrate(connectionPool) {
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(80) NOT NULL UNIQUE,
      email VARCHAR(160) NULL,
      display_name VARCHAR(120) NULL,
      full_name VARCHAR(160) NULL,
      phone VARCHAR(40) NULL,
      address_line1 VARCHAR(200) NULL,
      address_line2 VARCHAR(120) NULL,
      street VARCHAR(160) NULL,
      street_number VARCHAR(30) NULL,
      floor VARCHAR(30) NULL,
      apartment VARCHAR(30) NULL,
      address_reference VARCHAR(200) NULL,
      city VARCHAR(120) NULL,
      province VARCHAR(120) NULL,
      postal_code VARCHAR(30) NULL,
      country VARCHAR(80) NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      balance_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
      shop_name VARCHAR(120) NULL,
      shop_slug VARCHAR(80) NULL,
      password_hash VARCHAR(128) NOT NULL,
      salt VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(80) NOT NULL UNIQUE,
      password_hash VARCHAR(128) NOT NULL,
      salt VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS booster_packs (
      id VARCHAR(80) PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      series VARCHAR(160) NOT NULL,
      game VARCHAR(32) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      accent VARCHAR(16) NOT NULL,
      created_by VARCHAR(32) NOT NULL DEFAULT 'admin',
      shop_id INT NULL,
      shop_slug VARCHAR(80) NULL,
      shop_name VARCHAR(120) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await migrateExistingTables(connectionPool);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS booster_pack_items (
      slot_id VARCHAR(140) PRIMARY KEY,
      pack_id VARCHAR(80) NOT NULL,
      card_json JSON NOT NULL,
      probability DECIMAL(10,3) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX pack_id_idx (pack_id),
      CONSTRAINT booster_pack_items_pack_fk
        FOREIGN KEY (pack_id) REFERENCES booster_packs(id)
        ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS shop_card_stock (
      id INT AUTO_INCREMENT PRIMARY KEY,
      shop_id INT NOT NULL,
      shop_slug VARCHAR(80) NULL,
      card_key VARCHAR(220) NOT NULL,
      card_json JSON NOT NULL,
      quantity INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY shop_card_unique (shop_id, card_key),
      INDEX shop_stock_shop_idx (shop_id),
      INDEX shop_stock_slug_idx (shop_slug)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS user_cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      pack_id VARCHAR(80) NULL,
      pack_name VARCHAR(160) NULL,
      card_json JSON NOT NULL,
      value_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
      paid_price_usd DECIMAL(10,2) NULL,
      source_shop_id INT NULL,
      status ENUM('owned', 'waiting_stock', 'sold', 'withdrawn', 'upgraded', 'changed') NOT NULL DEFAULT 'owned',
      shipment_status ENUM('pending', 'shipped', 'delivered') NULL DEFAULT NULL,
      tracking_number VARCHAR(160) NULL,
      shipped_at DATETIME NULL,
      delivered_at DATETIME NULL,
      acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX user_cards_user_idx (user_id),
      INDEX user_cards_status_idx (status)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await connectionPool.query(
    "ALTER TABLE user_cards MODIFY status ENUM('owned', 'waiting_stock', 'sold', 'withdrawn', 'upgraded', 'changed') NOT NULL DEFAULT 'owned'",
  );

  const shippingAlterStatements = [
    "ALTER TABLE user_cards ADD COLUMN paid_price_usd DECIMAL(10,2) NULL AFTER value_usd",
    "ALTER TABLE user_cards ADD COLUMN source_shop_id INT NULL AFTER paid_price_usd",
    "ALTER TABLE user_cards ADD COLUMN shipment_status ENUM('pending', 'shipped', 'delivered') NULL DEFAULT NULL AFTER status",
    "ALTER TABLE user_cards ADD COLUMN tracking_number VARCHAR(160) NULL AFTER shipment_status",
    "ALTER TABLE user_cards ADD COLUMN shipped_at DATETIME NULL AFTER tracking_number",
    "ALTER TABLE user_cards ADD COLUMN delivered_at DATETIME NULL AFTER shipped_at",
    "ALTER TABLE user_cards ADD INDEX user_cards_shipment_idx (shipment_status)",
  ];

  for (const statement of shippingAlterStatements) {
    try {
      await connectionPool.query(statement);
    } catch (error) {
      if (!["ER_DUP_FIELDNAME", "ER_DUP_KEYNAME"].includes(error?.code)) {
        throw error;
      }
    }
  }

  await connectionPool.query(
    "ALTER TABLE user_cards MODIFY shipment_status ENUM('pending', 'shipped', 'delivered') NULL DEFAULT NULL",
  );

  await connectionPool.query(
    "UPDATE user_cards SET shipment_status = 'pending' WHERE status = 'withdrawn' AND shipment_status IS NULL",
  );
  await connectionPool.query(`
    UPDATE user_cards
    INNER JOIN booster_packs ON booster_packs.id = user_cards.pack_id
    SET user_cards.source_shop_id = booster_packs.shop_id
    WHERE user_cards.source_shop_id IS NULL
  `);
  await connectionPool.query(`
    UPDATE user_cards
    LEFT JOIN booster_packs ON booster_packs.id = user_cards.pack_id
    SET user_cards.paid_price_usd = COALESCE(booster_packs.price, 0)
    WHERE user_cards.paid_price_usd IS NULL
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS upgrader_runs (
      id VARCHAR(80) PRIMARY KEY,
      user_id INT NOT NULL,
      stake_card_ids JSON NOT NULL,
      stake_value_usd DECIMAL(10,2) NOT NULL,
      target_stock_id INT NOT NULL,
      target_card_json JSON NOT NULL,
      target_quantity INT NOT NULL DEFAULT 1,
      target_value_usd DECIMAL(10,2) NOT NULL,
      chance_percent DECIMAL(10,6) NOT NULL,
      roll_percent DECIMAL(10,6) NOT NULL,
      result ENUM('won', 'lost') NOT NULL,
      awarded_user_card_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX upgrader_user_idx (user_id),
      INDEX upgrader_created_idx (created_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  try {
    await connectionPool.query(
      "ALTER TABLE upgrader_runs ADD COLUMN target_quantity INT NOT NULL DEFAULT 1 AFTER target_card_json",
    );
  } catch (error) {
    if (error?.code !== "ER_DUP_FIELDNAME") {
      throw error;
    }
  }

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS changer_runs (
      id VARCHAR(80) PRIMARY KEY,
      user_id INT NOT NULL,
      stake_card_ids JSON NOT NULL,
      stake_value_usd DECIMAL(10,2) NOT NULL,
      target_items_json JSON NOT NULL,
      target_value_usd DECIMAL(10,2) NOT NULL,
      refund_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
      awarded_user_card_ids JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX changer_user_idx (user_id),
      INDEX changer_created_idx (created_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      token_hash CHAR(64) PRIMARY KEY,
      user_id INT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX user_sessions_user_idx (user_id),
      INDEX user_sessions_expires_idx (expires_at),
      CONSTRAINT user_sessions_user_fk
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await migrateLegacyPackIds(connectionPool);
}

async function migrateLegacyPackIds(connectionPool) {
  const [legacyPacks] = await connectionPool.query(
    "SELECT id FROM booster_packs WHERE id LIKE 'admin-%'",
  );

  for (const row of legacyPacks) {
    const legacyId = asTrimmedString(row.id);
    let cleanId = legacyId.slice("admin-".length) || randomUUID();
    const [existingRows] = await connectionPool.execute(
      "SELECT id FROM booster_packs WHERE id = ? LIMIT 1",
      [cleanId],
    );

    if (existingRows.length) {
      cleanId = randomUUID();
    }

    const connection = await connectionPool.getConnection();

    try {
      await connection.beginTransaction();
      await connection.execute(
        `
          INSERT INTO booster_packs (
            id, name, series, game, price, accent, created_by,
            shop_id, shop_slug, shop_name, created_at, updated_at
          )
          SELECT ?, name, series, game, price, accent, created_by,
            shop_id, shop_slug, shop_name, created_at, updated_at
          FROM booster_packs
          WHERE id = ?
        `,
        [cleanId, legacyId],
      );
      await connection.execute(
        "UPDATE booster_pack_items SET pack_id = ? WHERE pack_id = ?",
        [cleanId, legacyId],
      );
      await connection.execute(
        "UPDATE user_cards SET pack_id = ? WHERE pack_id = ?",
        [cleanId, legacyId],
      );
      await connection.execute("DELETE FROM booster_packs WHERE id = ?", [legacyId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

async function migrateExistingTables(connectionPool) {
  const alterStatements = [
    [
      "ALTER TABLE users ADD COLUMN shop_name VARCHAR(120) NULL",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN full_name VARCHAR(160) NULL AFTER display_name",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN phone VARCHAR(40) NULL AFTER full_name",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN address_line1 VARCHAR(200) NULL AFTER phone",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN address_line2 VARCHAR(120) NULL AFTER address_line1",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN street VARCHAR(160) NULL AFTER address_line2",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN street_number VARCHAR(30) NULL AFTER street",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN floor VARCHAR(30) NULL AFTER street_number",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN apartment VARCHAR(30) NULL AFTER floor",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN address_reference VARCHAR(200) NULL AFTER apartment",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN city VARCHAR(120) NULL AFTER address_line2",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN province VARCHAR(120) NULL AFTER city",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN postal_code VARCHAR(30) NULL AFTER province",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN country VARCHAR(80) NULL AFTER postal_code",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD COLUMN shop_slug VARCHAR(80) NULL",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE users ADD UNIQUE INDEX users_shop_slug_unique (shop_slug)",
      ["ER_DUP_KEYNAME", "ER_DUP_ENTRY"],
    ],
    [
      "ALTER TABLE booster_packs ADD COLUMN shop_id INT NULL",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE booster_packs ADD COLUMN shop_slug VARCHAR(80) NULL",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE booster_packs ADD COLUMN shop_name VARCHAR(120) NULL",
      ["ER_DUP_FIELDNAME"],
    ],
    [
      "ALTER TABLE booster_packs ADD INDEX booster_packs_shop_slug_idx (shop_slug)",
      ["ER_DUP_KEYNAME"],
    ],
  ];

  for (const [statement, ignoredCodes] of alterStatements) {
    try {
      await connectionPool.query(statement);
    } catch (error) {
      if (!ignoredCodes.includes(error?.code)) {
        throw error;
      }
    }
  }

  await connectionPool.query(
    "UPDATE users SET role = 'user', shop_name = NULL, shop_slug = NULL WHERE role = 'shop'",
  );
  await connectionPool.query(
    "ALTER TABLE users MODIFY role ENUM('user', 'admin') NOT NULL DEFAULT 'user'",
  );

  await connectionPool.execute(
    "UPDATE users SET shop_name = CASE WHEN shop_name IS NULL OR shop_name = 'HitShelf' THEN 'Pullario' ELSE shop_name END, shop_slug = CASE WHEN shop_slug IS NULL OR shop_slug = 'hitshelf' THEN 'pullario' ELSE shop_slug END WHERE username = ?",
    [config.adminUsername],
  );
  await connectionPool.execute(
    "UPDATE booster_packs SET shop_slug = 'pullario', shop_name = 'Pullario' WHERE created_by = 'admin' AND (shop_slug IS NULL OR shop_slug = 'hitshelf')",
  );
  await connectionPool.query(
    "UPDATE users SET country = 'Argentina' WHERE country IS NULL OR TRIM(country) = ''",
  );
}

async function seedAdmin(connectionPool) {
  const { salt, passwordHash } = await hashPassword(config.adminPassword);

  await connectionPool.execute(
    `
      INSERT INTO users (
        username, email, display_name, role, balance_usd,
        shop_name, shop_slug, password_hash, salt
      )
      VALUES (?, NULL, ?, 'admin', 0, 'Pullario', 'pullario', ?, ?)
      ON DUPLICATE KEY UPDATE
        role = 'admin',
        shop_name = CASE WHEN shop_name IS NULL OR shop_name = 'HitShelf' THEN 'Pullario' ELSE shop_name END,
        shop_slug = CASE WHEN shop_slug IS NULL OR shop_slug = 'hitshelf' THEN 'pullario' ELSE shop_slug END,
        password_hash = VALUES(password_hash),
        salt = VALUES(salt)
    `,
    [config.adminUsername, config.adminUsername, passwordHash, salt],
  );

  await connectionPool.execute(
    `
      INSERT INTO admin_users (username, password_hash, salt)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        salt = VALUES(salt)
    `,
    [config.adminUsername, passwordHash, salt],
  );
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;

  if (origin && config.corsAllowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
  }

  response.setHeader("Vary", "Origin");

  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
}

function enforceRateLimit(limiter, key) {
  const { allowed, retryAfterMs } = limiter.consume(key);

  if (!allowed) {
    const minutes = Math.max(1, Math.ceil(retryAfterMs / 60000));
    throw Object.assign(
      new Error(`Demasiados intentos. Proba de nuevo en ${minutes} min.`),
      { status: 429 },
    );
  }
}

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;

    if (body.length > 1024 * 1024) {
      throw Object.assign(new Error("El cuerpo del pedido es demasiado grande."), {
        status: 413,
      });
    }
  }

  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw Object.assign(new Error("JSON invalido."), { status: 400 });
  }
}

function getBearerToken(request) {
  const authorization = request.headers.authorization ?? "";
  const [scheme, token] = authorization.split(" ");

  return scheme?.toLowerCase() === "bearer" ? token : undefined;
}

// The HttpOnly cookie is the primary credential; Bearer stays as a fallback
// while older clients migrate.
function getSessionToken(request) {
  return (
    parseCookies(request.headers.cookie)[config.sessionCookieName] ||
    getBearerToken(request)
  );
}

function setSessionCookie(response, token) {
  response.setHeader(
    "Set-Cookie",
    serializeSessionCookie(config.sessionCookieName, token, {
      maxAgeMs: TOKEN_TTL_MS,
      domain: config.sessionCookieDomain,
      secure: config.sessionCookieSecure,
    }),
  );
}

function clearSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    serializeSessionCookie(config.sessionCookieName, "", {
      maxAgeMs: 0,
      domain: config.sessionCookieDomain,
      secure: config.sessionCookieSecure,
    }),
  );
}

// The token goes only in the HttpOnly cookie, never in the JSON body.
function sendSession(response, { token, user }) {
  setSessionCookie(response, token);
  sendJson(response, 200, { user });
}

async function requireUser(request) {
  const token = getSessionToken(request);

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return undefined;
  }

  const tokenHash = hashSessionToken(token);
  const connectionPool = await getPool();
  const [rows] = await connectionPool.execute(
    `
      SELECT users.*, user_sessions.expires_at AS session_expires_at
      FROM user_sessions
      JOIN users ON users.id = user_sessions.user_id
      WHERE user_sessions.token_hash = ? AND user_sessions.expires_at > UTC_TIMESTAMP()
      LIMIT 1
    `,
    [tokenHash],
  );
  const row = rows[0];

  if (!row) {
    return undefined;
  }

  const expiresAt = new Date(row.session_expires_at).getTime();

  if (expiresAt - Date.now() < TOKEN_TTL_MS - TOKEN_REFRESH_MS) {
    await connectionPool.execute(
      "UPDATE user_sessions SET expires_at = ? WHERE token_hash = ?",
      [new Date(Date.now() + TOKEN_TTL_MS), tokenHash],
    );
  }

  return { ...publicUser(row), token };
}

async function requireSeller(request) {
  const session = await requireUser(request);

  return session?.role === "admin" ? session : undefined;
}

async function deleteSession(token) {
  const connectionPool = await getPool();
  await connectionPool.execute("DELETE FROM user_sessions WHERE token_hash = ?", [
    hashSessionToken(token),
  ]);
}

async function deleteExpiredSessions() {
  const connectionPool = await getPool();
  await connectionPool.query(
    "DELETE FROM user_sessions WHERE expires_at <= UTC_TIMESTAMP()",
  );
}

async function listPacks() {
  const connectionPool = await getPool();
  let packSql =
    "SELECT id, name, series, game, price, accent, created_by, shop_id, shop_slug, shop_name FROM booster_packs WHERE created_by = 'admin'";

  packSql += " ORDER BY updated_at DESC";

  const [packRows] = await connectionPool.query(packSql);
  const [itemRows] = await connectionPool.query(
    "SELECT slot_id, pack_id, card_json, probability FROM booster_pack_items ORDER BY created_at ASC",
  );

  const itemsByPack = new Map();

  for (const row of itemRows) {
    const current = itemsByPack.get(row.pack_id) ?? [];
    current.push({
      slotId: row.slot_id,
      card: parseCard(row.card_json),
      probability: Number(row.probability),
    });
    itemsByPack.set(row.pack_id, current);
  }

  return packRows.map((row) => ({
    id: row.id,
    name: row.name,
    series: row.series,
    game: row.game,
    price: Number(row.price),
    accent: row.accent,
    createdBy: row.created_by,
    shopId: row.shop_id ? Number(row.shop_id) : undefined,
    shopSlug: row.shop_slug ?? undefined,
    shopName: row.shop_name ?? undefined,
    items: itemsByPack.get(row.id) ?? [],
  }));
}

function parseCard(value) {
  if (typeof value === "string") {
    return JSON.parse(value);
  }

  return value;
}

function asTrimmedString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeGame(value) {
  return ["one-piece", "pokemon", "magic", "mixed"].includes(value)
    ? value
    : "mixed";
}

function normalizeItemType(value) {
  return ["card", "sealed-pack", "sealed-box"].includes(value)
    ? value
    : "card";
}

function normalizeAccent(value, game) {
  if (typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value)) {
    return value;
  }

  return {
    "one-piece": "#15c8ff",
    pokemon: "#ffcc33",
    magic: "#c084fc",
    mixed: "#ff4f7b",
  }[game];
}

function normalizeCard(value) {
  const card = value && typeof value === "object" ? value : {};
  const game = normalizeGame(card.game);
  const itemType = normalizeItemType(card.itemType);

  return {
    id: asTrimmedString(card.id, randomUUID()),
    game: game === "mixed" ? "magic" : game,
    itemType,
    name: asTrimmedString(
      card.name,
      itemType === "card" ? "Carta sin nombre" : "Producto sellado sin nombre",
    ),
    setName: asTrimmedString(card.setName, "Set desconocido"),
    number: asTrimmedString(card.number) || undefined,
    rarity: asTrimmedString(card.rarity) || undefined,
    imageUrl: asTrimmedString(card.imageUrl) || undefined,
    priceUsd:
      typeof card.priceUsd === "number" && Number.isFinite(card.priceUsd)
        ? Number(card.priceUsd.toFixed(2))
        : undefined,
    priceSource: asTrimmedString(card.priceSource, "Manual"),
    sourceUrl: asTrimmedString(card.sourceUrl) || undefined,
    updatedAt: asTrimmedString(card.updatedAt) || undefined,
  };
}

function stockCardKey(card) {
  const normalizedCard = normalizeCard(card);
  const typePrefix =
    normalizedCard.itemType === "card" ? "" : `${normalizedCard.itemType}:`;

  return `${typePrefix}${normalizedCard.game}:${normalizedCard.id}`.slice(0, 220);
}

function publicStockItem(row) {
  return {
    id: Number(row.id),
    card: parseCard(row.card_json),
    quantity: Number(row.quantity ?? 0),
  };
}

function publicUserCard(row) {
  return {
    id: Number(row.id),
    packId: row.pack_id ?? undefined,
    packName: row.pack_name ?? "",
    card: parseCard(row.card_json),
    valueUsd: Number(row.value_usd ?? 0),
    status: row.status,
    shipmentStatus: row.shipment_status ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    shippedAt: row.shipped_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    acquiredAt: row.acquired_at,
  };
}

async function listUpgraderOptions(session) {
  const connectionPool = await getPool();
  const [inventoryRows] = session
    ? await connectionPool.execute(
        `
          SELECT id, pack_id, pack_name, card_json, value_usd, status,
            shipment_status, tracking_number, shipped_at, delivered_at, acquired_at
          FROM user_cards
          WHERE user_id = ? AND status IN ('owned', 'waiting_stock')
          ORDER BY value_usd DESC, acquired_at DESC
        `,
        [session.id],
      )
    : [[]];
  const [targetRows] = await connectionPool.execute(`
    SELECT shop_card_stock.id, shop_card_stock.card_json, shop_card_stock.quantity
    FROM shop_card_stock
    INNER JOIN users ON users.id = shop_card_stock.shop_id
    WHERE shop_card_stock.quantity > 0
      AND users.role = 'admin'
    ORDER BY CAST(JSON_UNQUOTE(JSON_EXTRACT(shop_card_stock.card_json, '$.priceUsd')) AS DECIMAL(10,2)) ASC
  `);

  return {
    inventory: inventoryRows.map(publicUserCard),
    targets: targetRows
      .map(publicStockItem)
      .filter((item) => Number(item.card?.priceUsd ?? 0) > 0),
    rtp: UPGRADER_RTP * 100,
    maxChance: UPGRADER_MAX_CHANCE,
  };
}

async function playUpgrader(session, body) {
  const rawIds = Array.isArray(body.stakeCardIds) ? body.stakeCardIds : [];
  const stakeCardIds = [...new Set(rawIds.map(Number).filter(Number.isInteger))];
  const targetStockId = Number(body.targetStockId);
  const targetQuantity = Number(body.targetQuantity ?? 1);

  if (!stakeCardIds.length || stakeCardIds.length > 20) {
    throw Object.assign(new Error("Elegí entre 1 y 20 premios para apostar."), {
      status: 400,
    });
  }

  if (!Number.isInteger(targetStockId) || targetStockId <= 0) {
    throw Object.assign(new Error("Elegí un premio objetivo."), { status: 400 });
  }

  if (!Number.isInteger(targetQuantity) || targetQuantity < 1 || targetQuantity > 20) {
    throw Object.assign(new Error("Elegí entre 1 y 20 unidades del premio."), {
      status: 400,
    });
  }

  const connectionPool = await getPool();
  const connection = await connectionPool.getConnection();

  try {
    await connection.beginTransaction();
    const placeholders = stakeCardIds.map(() => "?").join(", ");
    const [stakeRows] = await connection.execute(
      `
        SELECT id, value_usd, card_json
        FROM user_cards
        WHERE user_id = ?
          AND id IN (${placeholders})
          AND status IN ('owned', 'waiting_stock')
        FOR UPDATE
      `,
      [session.id, ...stakeCardIds],
    );

    if (stakeRows.length !== stakeCardIds.length) {
      throw Object.assign(
        new Error("Uno de los premios apostados ya no está disponible."),
        { status: 409 },
      );
    }

    const [targetRows] = await connection.execute(
      `
        SELECT shop_card_stock.id, shop_card_stock.shop_id,
          shop_card_stock.card_json, shop_card_stock.quantity
        FROM shop_card_stock
        INNER JOIN users ON users.id = shop_card_stock.shop_id
        WHERE shop_card_stock.id = ?
          AND shop_card_stock.quantity >= ?
          AND users.role = 'admin'
        LIMIT 1
        FOR UPDATE
      `,
      [targetStockId, targetQuantity],
    );
    const targetRow = targetRows[0];

    if (!targetRow) {
      throw Object.assign(new Error("El premio objetivo ya no está disponible."), {
        status: 409,
      });
    }

    const targetCard = normalizeCard(parseCard(targetRow.card_json));
    const targetKey = stockCardKey(targetCard);
    const repeatsStakedItem = stakeRows.some(
      (row) => stockCardKey(parseCard(row.card_json)) === targetKey,
    );

    if (repeatsStakedItem) {
      throw Object.assign(
        new Error("El premio objetivo debe ser distinto de los apostados."),
        { status: 400 },
      );
    }

    const targetUnitValue = Number(targetCard.priceUsd ?? 0);
    const targetValue = Number((targetUnitValue * targetQuantity).toFixed(2));
    const stakeValue = Number(
      stakeRows
        .reduce((total, row) => total + Number(row.value_usd ?? 0), 0)
        .toFixed(2),
    );
    const chance = upgraderChance(stakeValue, targetValue);

    if (!chance) {
      throw Object.assign(
        new Error("El premio objetivo debe valer más que la apuesta."),
        { status: 400 },
      );
    }

    const roll = rollPercent();
    const won = roll < chance;
    const runId = randomUUID();

    await connection.execute(
      `UPDATE user_cards SET status = 'upgraded' WHERE user_id = ? AND id IN (${placeholders})`,
      [session.id, ...stakeCardIds],
    );

    let awardedUserCardId = null;
    const awardedUserCardIds = [];
    if (won) {
      for (let index = 0; index < targetQuantity; index += 1) {
        const [insertResult] = await connection.execute(
          `
            INSERT INTO user_cards (
              user_id, pack_id, pack_name, card_json, value_usd,
              paid_price_usd, source_shop_id, status
            ) VALUES (?, NULL, 'Upgrader', ?, ?, 0, ?, 'owned')
          `,
          [
            session.id,
            JSON.stringify(targetCard),
            targetUnitValue,
            Number(targetRow.shop_id),
          ],
        );
        awardedUserCardIds.push(Number(insertResult.insertId));
      }
      awardedUserCardId = awardedUserCardIds[0] ?? null;
    }

    await connection.execute(
      `
        INSERT INTO upgrader_runs (
          id, user_id, stake_card_ids, stake_value_usd, target_stock_id,
          target_card_json, target_quantity, target_value_usd, chance_percent, roll_percent,
          result, awarded_user_card_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        runId,
        session.id,
        JSON.stringify(stakeCardIds),
        stakeValue,
        targetStockId,
        JSON.stringify(targetCard),
        targetQuantity,
        targetValue,
        chance,
        roll,
        won ? "won" : "lost",
        awardedUserCardId,
      ],
    );

    await connection.commit();
    return {
      runId,
      won,
      chance,
      roll,
      stakeValueUsd: stakeValue,
      target: publicStockItem(targetRow),
      targetQuantity,
      awardedUserCardId,
      awardedUserCardIds,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function playChanger(session, body) {
  const rawStakeIds = Array.isArray(body.stakeCardIds) ? body.stakeCardIds : [];
  const stakeCardIds = [...new Set(rawStakeIds.map(Number).filter(Number.isInteger))];
  const rawTargets = Array.isArray(body.targetItems) ? body.targetItems : [];
  const targetQuantities = new Map();

  for (const item of rawTargets) {
    const stockId = Number(item?.stockId);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(stockId) || stockId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      throw Object.assign(new Error("La selección de productos no es válida."), {
        status: 400,
      });
    }
    targetQuantities.set(stockId, (targetQuantities.get(stockId) ?? 0) + quantity);
  }

  const targetItems = [...targetQuantities].map(([stockId, quantity]) => ({
    stockId,
    quantity,
  }));
  const totalTargetUnits = targetItems.reduce((total, item) => total + item.quantity, 0);

  if (!stakeCardIds.length || stakeCardIds.length > 20) {
    throw Object.assign(new Error("Elegí entre 1 y 20 premios para cambiar."), {
      status: 400,
    });
  }
  if (!targetItems.length || totalTargetUnits > 20) {
    throw Object.assign(new Error("Elegí entre 1 y 20 productos para recibir."), {
      status: 400,
    });
  }

  const connectionPool = await getPool();
  const connection = await connectionPool.getConnection();

  try {
    await connection.beginTransaction();
    const stakePlaceholders = stakeCardIds.map(() => "?").join(", ");
    const [stakeRows] = await connection.execute(
      `
        SELECT id, value_usd, card_json
        FROM user_cards
        WHERE user_id = ?
          AND id IN (${stakePlaceholders})
          AND status IN ('owned', 'waiting_stock')
        FOR UPDATE
      `,
      [session.id, ...stakeCardIds],
    );

    if (stakeRows.length !== stakeCardIds.length) {
      throw Object.assign(new Error("Uno de tus premios ya no está disponible."), {
        status: 409,
      });
    }

    const targetIds = targetItems.map((item) => item.stockId);
    const targetPlaceholders = targetIds.map(() => "?").join(", ");
    const [targetRows] = await connection.execute(
      `
        SELECT shop_card_stock.id, shop_card_stock.shop_id,
          shop_card_stock.card_json, shop_card_stock.quantity
        FROM shop_card_stock
        INNER JOIN users ON users.id = shop_card_stock.shop_id
        WHERE shop_card_stock.id IN (${targetPlaceholders})
          AND shop_card_stock.quantity > 0
          AND users.role = 'admin'
        FOR UPDATE
      `,
      targetIds,
    );

    if (targetRows.length !== targetItems.length) {
      throw Object.assign(new Error("Uno de los productos ya no está disponible."), {
        status: 409,
      });
    }

    const rowsById = new Map(targetRows.map((row) => [Number(row.id), row]));
    const normalizedTargets = targetItems.map((item) => {
      const row = rowsById.get(item.stockId);
      if (!row || Number(row.quantity ?? 0) < item.quantity) {
        throw Object.assign(new Error("No hay suficiente stock de uno de los productos."), {
          status: 409,
        });
      }
      const card = normalizeCard(parseCard(row.card_json));
      const unitValueUsd = Number(card.priceUsd ?? 0);
      return { ...item, row, card, unitValueUsd };
    });

    const stakeValueUsd = Number(
      stakeRows.reduce((total, row) => total + Number(row.value_usd ?? 0), 0).toFixed(2),
    );
    const targetValueUsd = Number(
      normalizedTargets
        .reduce((total, item) => total + item.unitValueUsd * item.quantity, 0)
        .toFixed(2),
    );

    if (targetValueUsd <= 0 || targetValueUsd > stakeValueUsd) {
      throw Object.assign(
        new Error("El valor de los productos debe ser igual o menor al de tus premios."),
        { status: 400 },
      );
    }

    const refundUsd = Number((stakeValueUsd - targetValueUsd).toFixed(2));
    await connection.execute(
      `UPDATE user_cards SET status = 'changed' WHERE user_id = ? AND id IN (${stakePlaceholders})`,
      [session.id, ...stakeCardIds],
    );

    const awardedUserCardIds = [];
    for (const target of normalizedTargets) {
      for (let index = 0; index < target.quantity; index += 1) {
        const [insertResult] = await connection.execute(
          `
            INSERT INTO user_cards (
              user_id, pack_id, pack_name, card_json, value_usd,
              paid_price_usd, source_shop_id, status
            ) VALUES (?, NULL, 'Changer', ?, ?, 0, ?, 'owned')
          `,
          [
            session.id,
            JSON.stringify(target.card),
            target.unitValueUsd,
            Number(target.row.shop_id),
          ],
        );
        awardedUserCardIds.push(Number(insertResult.insertId));
      }
    }

    if (refundUsd > 0) {
      await connection.execute(
        "UPDATE users SET balance_usd = balance_usd + ? WHERE id = ?",
        [refundUsd, session.id],
      );
    }

    const runId = randomUUID();
    await connection.execute(
      `
        INSERT INTO changer_runs (
          id, user_id, stake_card_ids, stake_value_usd, target_items_json,
          target_value_usd, refund_usd, awarded_user_card_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        runId,
        session.id,
        JSON.stringify(stakeCardIds),
        stakeValueUsd,
        JSON.stringify(
          normalizedTargets.map((item) => ({
            stockId: item.stockId,
            quantity: item.quantity,
            card: item.card,
            unitValueUsd: item.unitValueUsd,
          })),
        ),
        targetValueUsd,
        refundUsd,
        JSON.stringify(awardedUserCardIds),
      ],
    );

    const [userRows] = await connection.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [session.id],
    );
    await connection.commit();

    return {
      runId,
      stakeValueUsd,
      targetValueUsd,
      refundUsd,
      awardedUserCardIds,
      targets: normalizedTargets.map((item) => ({
        stockId: item.stockId,
        quantity: item.quantity,
        card: item.card,
        unitValueUsd: item.unitValueUsd,
      })),
      user: publicUser(userRows[0]),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listShopStock(session) {
  const connectionPool = await getPool();
  const [rows] = await connectionPool.execute(
    "SELECT id, card_json, quantity FROM shop_card_stock WHERE shop_id = ? ORDER BY updated_at DESC",
    [session.id],
  );

  return rows.map(publicStockItem);
}

async function addShopStock(session, body) {
  const card = normalizeCard(body.card);
  const quantity =
    typeof body.quantity === "number" && Number.isFinite(body.quantity)
      ? Math.max(1, Math.floor(body.quantity))
      : 1;
  const connectionPool = await getPool();
  const cardKey = stockCardKey(card);

  await connectionPool.execute(
    `
      INSERT INTO shop_card_stock (shop_id, shop_slug, card_key, card_json, quantity)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        card_json = VALUES(card_json),
        quantity = quantity + VALUES(quantity),
        shop_slug = VALUES(shop_slug)
    `,
    [
      session.id,
      session.shopSlug || (session.role === "admin" ? "pullario" : null),
      cardKey,
      JSON.stringify(card),
      quantity,
    ],
  );

  const [rows] = await connectionPool.execute(
    "SELECT id, card_json, quantity FROM shop_card_stock WHERE shop_id = ? AND card_key = ? LIMIT 1",
    [session.id, cardKey],
  );

  return publicStockItem(rows[0]);
}

async function updateShopStock(session, stockId, body) {
  const connectionPool = await getPool();
  const [existingRows] = await connectionPool.execute(
    "SELECT id, card_json, quantity FROM shop_card_stock WHERE id = ? AND shop_id = ? LIMIT 1",
    [stockId, session.id],
  );

  if (!existingRows.length) {
    throw Object.assign(new Error("No encontre ese producto en tu stock."), {
      status: 404,
    });
  }

  const existingRow = existingRows[0];
  const hasQuantityUpdate =
    typeof body.quantity === "number" && Number.isFinite(body.quantity);
  const quantity =
    hasQuantityUpdate
      ? Math.max(0, Math.floor(body.quantity))
      : Number(existingRow.quantity ?? 0);
  let card = parseCard(existingRow.card_json);

  if (body.card && typeof body.card === "object") {
    const priceUsd = Number(body.card.priceUsd);
    const imageUrl = asTrimmedString(body.card.imageUrl);

    if (!Number.isFinite(priceUsd) || priceUsd < 0) {
      throw Object.assign(new Error("Ingresa un precio valido."), {
        status: 400,
      });
    }

    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      throw Object.assign(
        new Error("La imagen debe usar una direccion http o https."),
        { status: 400 },
      );
    }

    card = normalizeCard({
      ...card,
      imageUrl: imageUrl || undefined,
      priceUsd,
      priceSource: "Precio manual de Pullario",
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  }

  if (hasQuantityUpdate && quantity <= 0) {
    await connectionPool.execute(
      "DELETE FROM shop_card_stock WHERE id = ? AND shop_id = ?",
      [stockId, session.id],
    );
    return { deleted: true };
  }

  const [result] = await connectionPool.execute(
    "UPDATE shop_card_stock SET quantity = ?, card_json = ? WHERE id = ? AND shop_id = ?",
    [quantity, JSON.stringify(card), stockId, session.id],
  );

  if (!result.affectedRows) {
    throw Object.assign(new Error("No encontre esa carta en tu stock."), {
      status: 404,
    });
  }

  const [rows] = await connectionPool.execute(
    "SELECT id, card_json, quantity FROM shop_card_stock WHERE id = ? AND shop_id = ? LIMIT 1",
    [stockId, session.id],
  );

  return { stock: publicStockItem(rows[0]) };
}

async function listUserCards(session) {
  const connectionPool = await getPool();
  const [rows] = await connectionPool.execute(
    `
      SELECT id, pack_id, pack_name, card_json, value_usd, status,
        shipment_status, tracking_number, shipped_at, delivered_at, acquired_at
      FROM user_cards
      WHERE user_id = ?
      ORDER BY acquired_at DESC
    `,
    [session.id],
  );
  const cards = rows.map(publicUserCard);
  const availableCards = cards.filter(
    (item) => item.status === "owned" || item.status === "waiting_stock",
  );

  return {
    cards,
    totalValueUsd: availableCards.reduce(
      (total, item) => total + item.valueUsd,
      0,
    ),
    ownedValueUsd: availableCards.reduce(
      (total, item) => total + item.valueUsd,
      0,
    ),
    lifetimeValueUsd: cards.reduce((total, item) => total + item.valueUsd, 0),
  };
}

function publicShopOrder(row) {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    username: row.username ?? "",
    displayName: row.display_name ?? "",
    packId: row.pack_id ?? undefined,
    packName: row.pack_name ?? "",
    card: parseCard(row.card_json),
    valueUsd: Number(row.value_usd ?? 0),
    status: row.status,
    shipmentStatus: row.shipment_status ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    shippedAt: row.shipped_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    acquiredAt: row.acquired_at,
  };
}

function publicDrop(row) {
  return {
    id: Number(row.id),
    username: row.username ?? "",
    displayName: row.display_name ?? "",
    packId: row.pack_id ?? undefined,
    packName: row.pack_name ?? "",
    packPrice: Number(row.pack_price ?? 0),
    card: parseCard(row.card_json),
    valueUsd: Number(row.value_usd ?? 0),
    acquiredAt: row.acquired_at,
  };
}

async function listPublicDrops({ packId = "", limit = 12 } = {}) {
  const connectionPool = await getPool();
  const params = [];
  let packWhere = "";
  const safeLimit = Math.min(30, Math.max(1, Number(limit) || 12));

  if (asTrimmedString(packId)) {
    packWhere = "AND user_cards.pack_id = ?";
    params.push(asTrimmedString(packId).slice(0, 80));
  }

  const [rows] = await connectionPool.execute(
    `
      SELECT
        user_cards.id,
        users.username,
        users.display_name,
        user_cards.pack_id,
        user_cards.pack_name,
        user_cards.card_json,
        user_cards.value_usd,
        user_cards.acquired_at,
        packs.price AS pack_price
      FROM user_cards
      INNER JOIN booster_packs AS packs ON packs.id = user_cards.pack_id
      INNER JOIN users ON users.id = user_cards.user_id
      WHERE user_cards.value_usd >= packs.price
      ${packWhere}
      ORDER BY user_cards.acquired_at DESC
      LIMIT ${safeLimit}
    `,
    params,
  );

  return rows.map(publicDrop);
}

async function listShopOrders() {
  const connectionPool = await getPool();

  const [rows] = await connectionPool.execute(
    `
      SELECT
        user_cards.id,
        user_cards.user_id,
        users.username,
        users.display_name,
        user_cards.pack_id,
        user_cards.pack_name,
        user_cards.card_json,
        user_cards.value_usd,
        user_cards.status,
        user_cards.shipment_status,
        user_cards.tracking_number,
        user_cards.shipped_at,
        user_cards.acquired_at
      FROM user_cards
      INNER JOIN booster_packs AS packs ON packs.id = user_cards.pack_id
      INNER JOIN users ON users.id = user_cards.user_id
      WHERE packs.created_by = 'admin'
        AND user_cards.status = 'withdrawn'
        AND COALESCE(user_cards.shipment_status, 'pending') = 'pending'
      ORDER BY user_cards.acquired_at DESC
    `,
  );
  const orders = rows.map(publicShopOrder);

  return {
    orders,
    withdrawnCount: orders.filter((item) => item.status === "withdrawn").length,
    userCount: new Set(orders.map((item) => item.userId)).size,
  };
}

async function markShopOrdersShipped(body) {
  const shipments = Array.isArray(body.shipments) ? body.shipments : [];

  if (!shipments.length || shipments.length > 100) {
    throw Object.assign(
      new Error("Selecciona entre 1 y 100 retiros para confirmar el envio."),
      { status: 400 },
    );
  }

  const normalizedShipments = shipments.map((shipment) => {
    const id = Number(shipment?.id);
    const trackingNumber = asTrimmedString(shipment?.trackingNumber).slice(0, 160);

    if (!Number.isInteger(id) || id <= 0 || trackingNumber.length < 3) {
      throw Object.assign(
        new Error("Cada retiro seleccionado necesita un numero de seguimiento."),
        { status: 400 },
      );
    }

    return { id, trackingNumber };
  });

  const connectionPool = await getPool();
  const connection = await connectionPool.getConnection();

  try {
    await connection.beginTransaction();

    const shipmentIds = normalizedShipments.map((shipment) => shipment.id);
    const placeholders = shipmentIds.map(() => "?").join(", ");
    const [activeRows] = await connection.execute(
      `
        SELECT user_cards.id, user_cards.user_id
        FROM user_cards
        INNER JOIN booster_packs ON booster_packs.id = user_cards.pack_id
        WHERE user_cards.id IN (${placeholders})
          AND user_cards.status = 'withdrawn'
          AND COALESCE(user_cards.shipment_status, 'pending') = 'pending'
          AND booster_packs.created_by = 'admin'
        FOR UPDATE
      `,
      shipmentIds,
    );

    if (
      activeRows.length !== shipmentIds.length ||
      new Set(activeRows.map((row) => Number(row.user_id))).size !== 1
    ) {
      throw Object.assign(
        new Error(
          "Los retiros deben seguir activos y pertenecer al mismo usuario.",
        ),
        { status: 409 },
      );
    }

    for (const shipment of normalizedShipments) {
      const [result] = await connection.execute(
        `
          UPDATE user_cards
          INNER JOIN booster_packs ON booster_packs.id = user_cards.pack_id
          SET
            user_cards.shipment_status = 'shipped',
            user_cards.tracking_number = ?,
            user_cards.shipped_at = NOW()
          WHERE user_cards.id = ?
            AND user_cards.status = 'withdrawn'
            AND COALESCE(user_cards.shipment_status, 'pending') = 'pending'
            AND booster_packs.created_by = 'admin'
        `,
        [shipment.trackingNumber, shipment.id],
      );

      if (!result.affectedRows) {
        throw Object.assign(
          new Error("Uno de los retiros ya fue enviado o dejo de estar activo."),
          { status: 409 },
        );
      }
    }

    await connection.commit();
    return { ok: true, shippedCount: normalizedShipments.length };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listShopShipments() {
  const connectionPool = await getPool();
  const [rows] = await connectionPool.execute(
    `
      SELECT
        user_cards.id,
        user_cards.user_id,
        users.username,
        users.display_name,
        user_cards.pack_id,
        user_cards.pack_name,
        user_cards.card_json,
        user_cards.value_usd,
        user_cards.status,
        user_cards.shipment_status,
        user_cards.tracking_number,
        user_cards.shipped_at,
        user_cards.delivered_at,
        user_cards.acquired_at
      FROM user_cards
      INNER JOIN booster_packs AS packs ON packs.id = user_cards.pack_id
      INNER JOIN users ON users.id = user_cards.user_id
      WHERE packs.created_by = 'admin'
        AND user_cards.status = 'withdrawn'
        AND user_cards.shipment_status IN ('shipped', 'delivered')
      ORDER BY COALESCE(user_cards.delivered_at, user_cards.shipped_at) DESC
    `,
  );
  const shipments = rows.map(publicShopOrder);

  return {
    active: shipments.filter((item) => item.shipmentStatus === "shipped"),
    history: shipments.filter((item) => item.shipmentStatus === "delivered"),
  };
}

async function markShipmentDelivered(body) {
  const ids = Array.isArray(body.ids)
    ? [...new Set(body.ids.map(Number).filter((id) => Number.isInteger(id) && id > 0))]
    : [];

  if (!ids.length || ids.length > 100) {
    throw Object.assign(new Error("Selecciona un envio activo para confirmar."), {
      status: 400,
    });
  }

  const connectionPool = await getPool();
  const placeholders = ids.map(() => "?").join(", ");
  const [result] = await connectionPool.execute(
    `
      UPDATE user_cards
      INNER JOIN booster_packs ON booster_packs.id = user_cards.pack_id
      SET
        user_cards.shipment_status = 'delivered',
        user_cards.delivered_at = NOW()
      WHERE user_cards.id IN (${placeholders})
        AND user_cards.status = 'withdrawn'
        AND user_cards.shipment_status = 'shipped'
        AND booster_packs.created_by = 'admin'
    `,
    ids,
  );

  if (result.affectedRows !== ids.length) {
    throw Object.assign(
      new Error("El envio ya fue recibido o dejo de estar activo."),
      { status: 409 },
    );
  }

  return { ok: true, deliveredCount: result.affectedRows };
}

async function listAdminUsers(query = "") {
  const connectionPool = await getPool();
  const normalizedQuery = asTrimmedString(query).slice(0, 80);
  const search = `%${normalizedQuery}%`;
  const [rows] = await connectionPool.execute(
    `
      SELECT
        users.id,
        users.username,
        users.display_name,
        users.email,
        COUNT(user_cards.id) AS prize_count,
        SUM(CASE WHEN user_cards.status IN ('owned', 'waiting_stock') THEN 1 ELSE 0 END) AS active_count,
        COALESCE(SUM(user_cards.paid_price_usd), 0) AS spent_value,
        COALESCE(SUM(CASE WHEN user_cards.status = 'withdrawn' THEN user_cards.value_usd ELSE 0 END), 0) AS withdrawn_value
      FROM users
      LEFT JOIN user_cards ON user_cards.user_id = users.id
      WHERE users.username LIKE ? OR COALESCE(users.display_name, '') LIKE ? OR COALESCE(users.email, '') LIKE ?
      GROUP BY users.id, users.username, users.display_name, users.email
      ORDER BY users.username ASC
      LIMIT 50
    `,
    [search, search, search],
  );

  return rows.map((row) => ({
    id: Number(row.id),
    username: row.username ?? "",
    displayName: row.display_name ?? "",
    email: row.email ?? "",
    prizeCount: Number(row.prize_count ?? 0),
    activeCount: Number(row.active_count ?? 0),
    spentValueUsd: Number(row.spent_value ?? 0),
    withdrawnValueUsd: Number(row.withdrawn_value ?? 0),
  }));
}

async function listAdminUserCards(userId) {
  const connectionPool = await getPool();
  const [userRows] = await connectionPool.execute(
    "SELECT id, username, display_name, email FROM users WHERE id = ? LIMIT 1",
    [userId],
  );

  if (!userRows[0]) {
    throw Object.assign(new Error("No encontre ese usuario."), { status: 404 });
  }

  const [cardRows] = await connectionPool.execute(
    `
      SELECT id, pack_id, pack_name, card_json, value_usd, status,
        shipment_status, tracking_number, shipped_at, delivered_at, acquired_at
      FROM user_cards
      WHERE user_id = ?
      ORDER BY acquired_at DESC
    `,
    [userId],
  );

  const user = userRows[0];
  return {
    user: {
      id: Number(user.id),
      username: user.username ?? "",
      displayName: user.display_name ?? "",
      email: user.email ?? "",
    },
    cards: cardRows.map(publicUserCard),
  };
}

function normalizePackBody(body, session) {
  const items = Array.isArray(body.items) ? body.items : [];

  if (!asTrimmedString(body.name) || !items.length) {
    throw Object.assign(new Error("La caja necesita nombre y al menos un premio."), {
      status: 400,
    });
  }

  const game = normalizeGame(body.game);
  const shopSlug = "pullario";
  const shopName = "Pullario";
  const createdBy = "admin";

  return {
    id:
      asTrimmedString(body.id).match(/^[a-zA-Z0-9:_-]{1,80}$/)?.[0] ??
      randomUUID(),
    name: asTrimmedString(body.name).slice(0, 160),
    series: asTrimmedString(body.series, "Serie local").slice(0, 160),
    game,
    price:
      typeof body.price === "number" && Number.isFinite(body.price)
        ? Number(Math.max(0, body.price).toFixed(2))
        : 0,
    accent: normalizeAccent(body.accent, game),
    createdBy,
    shopId: session?.id,
    shopSlug,
    shopName,
    items: items.map((item) => ({
      slotId: asTrimmedString(item?.slotId, `slot-${randomUUID()}`).slice(0, 140),
      card: normalizeCard(item?.card),
      probability:
        typeof item?.probability === "number" && Number.isFinite(item.probability)
          ? Number(Math.max(0, item.probability).toFixed(3))
          : 0,
    })),
  };
}

async function savePack(body, session) {
  const pack = normalizePackBody(body, session);
  const connectionPool = await getPool();
  const connection = await connectionPool.getConnection();

  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.execute(
      "SELECT shop_id FROM booster_packs WHERE id = ? LIMIT 1 FOR UPDATE",
      [pack.id],
    );
    const existingShopId = existingRows[0]?.shop_id;

    if (existingShopId != null && Number(existingShopId) !== session.id) {
      throw Object.assign(new Error("Ese pack pertenece a otra tienda."), {
        status: 403,
      });
    }

    const cardKeys = pack.items.map((item) => stockCardKey(item.card));
    const placeholders = cardKeys.map(() => "?").join(",");
    const [stockRows] = await connection.execute(
      `
        SELECT card_key, quantity
        FROM shop_card_stock
        WHERE shop_id = ? AND card_key IN (${placeholders})
      `,
      [session.id, ...cardKeys],
    );
    const stockByKey = new Map(
      stockRows.map((row) => [row.card_key, Number(row.quantity ?? 0)]),
    );
    const missingStockItem = pack.items.find(
      (item) => (stockByKey.get(stockCardKey(item.card)) ?? 0) <= 0,
    );

    if (missingStockItem) {
      throw Object.assign(
        new Error(
          `${missingStockItem.card.name} no esta en tu stock disponible.`,
        ),
        { status: 400 },
      );
    }

    await connection.execute(
      `
        INSERT INTO booster_packs (
          id, name, series, game, price, accent,
          created_by, shop_id, shop_slug, shop_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          series = VALUES(series),
          game = VALUES(game),
          price = VALUES(price),
          accent = VALUES(accent),
          created_by = VALUES(created_by),
          shop_id = VALUES(shop_id),
          shop_slug = VALUES(shop_slug),
          shop_name = VALUES(shop_name)
      `,
      [
        pack.id,
        pack.name,
        pack.series,
        pack.game,
        pack.price,
        pack.accent,
        pack.createdBy,
        pack.shopId,
        pack.shopSlug,
        pack.shopName,
      ],
    );
    await connection.execute("DELETE FROM booster_pack_items WHERE pack_id = ?", [
      pack.id,
    ]);

    for (const item of pack.items) {
      await connection.execute(
        `
          INSERT INTO booster_pack_items (slot_id, pack_id, card_json, probability)
          VALUES (?, ?, ?, ?)
        `,
        [
          item.slotId,
          pack.id,
          JSON.stringify(item.card),
          item.probability,
        ],
      );
    }

    await connection.commit();
    return pack;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Legacy packs created before shops existed have no shop_id.
async function deletePackForSession(packId, session) {
  const connectionPool = await getPool();
  const [result] = await connectionPool.execute(
    "DELETE FROM booster_packs WHERE id = ? AND (shop_id = ? OR shop_id IS NULL)",
    [packId, session.id],
  );

  if (!result.affectedRows) {
    throw Object.assign(new Error("Pack no encontrado."), { status: 404 });
  }
}

async function openPackForUser(packId, session) {
  const connectionPool = await getPool();
  const connection = await connectionPool.getConnection();

  try {
    await connection.beginTransaction();
    const [packRows] = await connection.execute(
      `
        SELECT id, name, series, game, price, accent, created_by, shop_id, shop_slug, shop_name
        FROM booster_packs
        WHERE id = ?
        LIMIT 1
      `,
      [packId],
    );
    const pack = packRows[0];

    if (!pack) {
      throw Object.assign(new Error("No encontre esa caja."), { status: 404 });
    }

    const [userRows] = await connection.execute(
      "SELECT * FROM users WHERE id = ? FOR UPDATE",
      [session.id],
    );
    const buyer = userRows[0];
    const packPrice = Number(pack.price ?? 0);

    if (!buyer || Number(buyer.balance_usd ?? 0) < packPrice) {
      throw Object.assign(new Error("Saldo insuficiente para abrir esta caja."), {
        status: 402,
      });
    }

    const [itemRows] = await connection.execute(
      "SELECT slot_id, card_json, probability FROM booster_pack_items WHERE pack_id = ?",
      [pack.id],
    );
    const items = itemRows.map((row) => ({
      slotId: row.slot_id,
      card: parseCard(row.card_json),
      probability: Number(row.probability),
    }));

    if (!items.length) {
      throw Object.assign(new Error("Esta caja no tiene premios."), {
        status: 400,
      });
    }

    const shopId = pack.shop_id ? Number(pack.shop_id) : undefined;

    if (!shopId) {
      throw Object.assign(
        new Error("Esta caja no esta asociada al stock de Pullario."),
        { status: 400 },
      );
    }

    const winner = weightedPick(items);

    await connection.execute(
      "UPDATE users SET balance_usd = balance_usd - ? WHERE id = ?",
      [packPrice, session.id],
    );
    if (shopId !== session.id) {
      await connection.execute(
        "UPDATE users SET balance_usd = balance_usd + ? WHERE id = ?",
        [packPrice, shopId],
      );
    }
    const [insertResult] = await connection.execute(
      `
        INSERT INTO user_cards (
          user_id, pack_id, pack_name, card_json, value_usd,
          paid_price_usd, source_shop_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'owned')
      `,
      [
        session.id,
        pack.id,
        pack.name,
        JSON.stringify(normalizeCard(winner.card)),
        Number(Math.max(0, winner.card.priceUsd ?? 0).toFixed(2)),
        packPrice,
        shopId,
      ],
    );
    const [updatedUserRows] = await connection.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [session.id],
    );

    await connection.commit();

    return {
      item: winner,
      userCardId: Number(insertResult.insertId),
      user: publicUser(updatedUserRows[0]),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function shippingAddressMissingFields(row) {
  const country = asTrimmedString(row?.country) || "Argentina";
  const requiredFields = [
    ["full_name", "nombre y apellido"],
    ["province", "provincia"],
    ["city", "ciudad"],
    ["street", "calle"],
    ["street_number", "numero"],
    ["postal_code", "codigo postal"],
  ];
  const missing = requiredFields
    .filter(([field]) => !asTrimmedString(row?.[field]))
    .map(([, label]) => label);

  if (
    country.toLocaleLowerCase("es") !== "argentina"
  ) {
    missing.push("pais habilitado para envios (Argentina)");
  }

  return missing;
}

function publicUser(row) {
  const shippingAddressMissing = shippingAddressMissingFields(row);

  return {
    id: Number(row.id),
    username: row.username,
    role: row.role,
    displayName: row.display_name ?? "",
    email: row.email ?? "",
    fullName: row.full_name ?? "",
    phone: row.phone ?? "",
    addressLine1: row.address_line1 ?? "",
    addressLine2: row.address_line2 ?? "",
    street: row.street ?? row.address_line1 ?? "",
    streetNumber: row.street_number ?? "",
    floor: row.floor ?? "",
    apartment: row.apartment ?? "",
    addressReference: row.address_reference ?? row.address_line2 ?? "",
    city: row.city ?? "",
    province: row.province ?? "",
    postalCode: row.postal_code ?? "",
    country: asTrimmedString(row.country) || "Argentina",
    hasShippingAddress: shippingAddressMissing.length === 0,
    shippingAddressMissing,
    balanceUsd: Number(row.balance_usd ?? 0),
    shopName: row.shop_name ?? "",
    shopSlug: row.shop_slug ?? "",
  };
}

async function createSession(user) {
  const token = createSessionToken();
  const connectionPool = await getPool();

  await connectionPool.execute(
    "INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    [hashSessionToken(token), user.id, new Date(Date.now() + TOKEN_TTL_MS)],
  );

  return { token, user: publicUser(user) };
}

async function login(body) {
  const username = asTrimmedString(body.username);
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    throw Object.assign(new Error("Usuario y password son obligatorios."), {
      status: 400,
    });
  }

  const connectionPool = await getPool();
  const [rows] = await connectionPool.execute(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username],
  );
  const user = rows[0];

  if (!user || !(await verifyPassword(password, user.salt, user.password_hash))) {
    throw Object.assign(new Error("Credenciales invalidas."), { status: 401 });
  }

  return createSession(user);
}

async function register(body) {
  const username = asTrimmedString(body.username);
  const email = asTrimmedString(body.email) || null;
  const password = typeof body.password === "string" ? body.password : "";
  const role = "user";

  if (!username || !password) {
    throw Object.assign(new Error("Usuario y password son obligatorios."), {
      status: 400,
    });
  }

  if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) {
    throw Object.assign(
      new Error("El usuario debe tener 3 a 40 caracteres simples."),
      { status: 400 },
    );
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw Object.assign(new Error(`El password necesita al menos ${PASSWORD_MIN_LENGTH} caracteres.`), {
      status: 400,
    });
  }

  const { salt, passwordHash } = await hashPassword(password);
  const connectionPool = await getPool();

  try {
    await connectionPool.execute(
      `
        INSERT INTO users (
          username, email, display_name, role, balance_usd,
          shop_name, shop_slug, password_hash, salt
        )
        VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
      `,
      [
        username,
        email,
        username,
        role,
        null,
        null,
        passwordHash,
        salt,
      ],
    );
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      throw Object.assign(
        new Error(
          "Ese usuario ya existe.",
        ),
        { status: 409 },
      );
    }

    throw error;
  }

  const [rows] = await connectionPool.execute(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username],
  );

  return createSession(rows[0]);
}

async function getMe(session) {
  const connectionPool = await getPool();
  const [rows] = await connectionPool.execute(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [session.id],
  );
  const user = rows[0];

  if (!user) {
    throw Object.assign(new Error("Sesion invalida."), { status: 401 });
  }

  return { user: publicUser(user) };
}

async function updateMe(session, body) {
  const displayName = asTrimmedString(body.displayName, session.username).slice(
    0,
    120,
  );
  const email = asTrimmedString(body.email).slice(0, 160) || null;
  const fullName = asTrimmedString(body.fullName).slice(0, 160) || null;
  const phone = asTrimmedString(body.phone).slice(0, 40) || null;
  const street = asTrimmedString(body.street ?? body.addressLine1).slice(0, 160) || null;
  const streetNumber = asTrimmedString(body.streetNumber).slice(0, 30) || null;
  const floor = asTrimmedString(body.floor).slice(0, 30) || null;
  const apartment = asTrimmedString(body.apartment).slice(0, 30) || null;
  const addressReference =
    asTrimmedString(body.addressReference ?? body.addressLine2).slice(0, 200) ||
    null;
  const addressLine1 = [street, streetNumber].filter(Boolean).join(" ") || null;
  const addressLine2 =
    [floor && `Piso ${floor}`, apartment && `Depto ${apartment}`, addressReference]
      .filter(Boolean)
      .join(" - ") || null;
  const city = asTrimmedString(body.city).slice(0, 120) || null;
  const province = asTrimmedString(body.province).slice(0, 120) || null;
  const postalCode = asTrimmedString(body.postalCode).slice(0, 30) || null;
  const country = asTrimmedString(body.country).slice(0, 80) || "Argentina";
  const password = typeof body.password === "string" ? body.password : "";
  const shopName = session.role === "admin" ? "Pullario" : "";
  const connectionPool = await getPool();

  if (password.trim()) {
    if (password.length < PASSWORD_MIN_LENGTH) {
      throw Object.assign(
        new Error(`El password necesita al menos ${PASSWORD_MIN_LENGTH} caracteres.`),
        { status: 400 },
      );
    }

    const { salt, passwordHash } = await hashPassword(password);
    await connectionPool.execute(
      `UPDATE users SET display_name = ?, email = ?, full_name = ?, phone = ?,
        address_line1 = ?, address_line2 = ?, street = ?, street_number = ?, floor = ?, apartment = ?,
        address_reference = ?, city = ?, province = ?, postal_code = ?, country = ?,
        shop_name = COALESCE(NULLIF(?, ''), shop_name), password_hash = ?, salt = ? WHERE id = ?`,
      [
        displayName, email, fullName, phone, addressLine1, addressLine2, street,
        streetNumber, floor, apartment, addressReference, city, province,
        postalCode, country, shopName, passwordHash, salt, session.id,
      ],
    );
    await connectionPool.execute(
      "DELETE FROM user_sessions WHERE user_id = ? AND token_hash <> ?",
      [session.id, hashSessionToken(session.token)],
    );
  } else {
    await connectionPool.execute(
      `UPDATE users SET display_name = ?, email = ?, full_name = ?, phone = ?,
        address_line1 = ?, address_line2 = ?, street = ?, street_number = ?, floor = ?, apartment = ?,
        address_reference = ?, city = ?, province = ?, postal_code = ?, country = ?,
        shop_name = COALESCE(NULLIF(?, ''), shop_name) WHERE id = ?`,
      [
        displayName, email, fullName, phone, addressLine1, addressLine2, street,
        streetNumber, floor, apartment, addressReference, city, province,
        postalCode, country, shopName, session.id,
      ],
    );
  }

  if (shopName) {
    await connectionPool.execute(
      "UPDATE booster_packs SET shop_name = ? WHERE shop_id = ?",
      [shopName, session.id],
    );
  }

  const [rows] = await connectionPool.execute(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [session.id],
  );
  return { user: publicUser(rows[0]) };
}

async function topUpWallet(session, body) {
  const amount =
    typeof body.amount === "number" && Number.isFinite(body.amount)
      ? Number(Math.max(0, body.amount).toFixed(2))
      : 0;

  if (amount <= 0 || amount > 100000) {
    throw Object.assign(new Error("Ingresa un monto valido para recargar."), {
      status: 400,
    });
  }

  const connectionPool = await getPool();
  await connectionPool.execute(
    "UPDATE users SET balance_usd = balance_usd + ? WHERE id = ?",
    [amount, session.id],
  );

  const [rows] = await connectionPool.execute(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [session.id],
  );

  return { user: publicUser(rows[0]) };
}

async function sellUserCard(session, cardId) {
  const connectionPool = await getPool();
  const connection = await connectionPool.getConnection();

  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT id, value_usd FROM user_cards WHERE id = ? AND user_id = ? AND status IN ('owned', 'waiting_stock') FOR UPDATE",
      [cardId, session.id],
    );
    const card = rows[0];

    if (!card) {
      throw Object.assign(new Error("No encontre ese premio en tu inventario."), {
        status: 404,
      });
    }

    const value = Number(card.value_usd ?? 0);

    await connection.execute(
      "UPDATE user_cards SET status = 'sold' WHERE id = ? AND user_id = ?",
      [cardId, session.id],
    );
    await connection.execute(
      "UPDATE users SET balance_usd = balance_usd + ? WHERE id = ?",
      [value, session.id],
    );
    const [userRows] = await connection.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [session.id],
    );
    await connection.commit();

    return { user: publicUser(userRows[0]), valueUsd: value };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function withdrawUserCard(session, cardId) {
  const connectionPool = await getPool();
  const connection = await connectionPool.getConnection();

  try {
    await connection.beginTransaction();
    const [addressRows] = await connection.execute(
      `SELECT full_name, street, street_number, city, province, postal_code, country
       FROM users WHERE id = ? LIMIT 1 FOR UPDATE`,
      [session.id],
    );
    const address = addressRows[0];
    const missingAddressFields = shippingAddressMissingFields(address);

    if (missingAddressFields.length) {
      throw Object.assign(
        new Error(
          `Completa estos datos antes de retirar premios: ${missingAddressFields.join(
            ", ",
          )}.`,
        ),
        { status: 400, code: "SHIPPING_ADDRESS_REQUIRED" },
      );
    }

    const [cardRows] = await connection.execute(
      `
        SELECT id, card_json, status, pack_id, source_shop_id
        FROM user_cards
        WHERE id = ?
          AND user_id = ?
          AND status IN ('owned', 'waiting_stock')
        FOR UPDATE
      `,
      [cardId, session.id],
    );
    const userCard = cardRows[0];

    if (!userCard) {
      throw Object.assign(new Error("No encontre ese premio en tu inventario."), {
        status: 404,
      });
    }

    let shopId = Number(userCard.source_shop_id ?? 0);

    if (!shopId && userCard.pack_id) {
      const [packRows] = await connection.execute(
        "SELECT shop_id FROM booster_packs WHERE id = ? LIMIT 1",
        [userCard.pack_id],
      );
      shopId = Number(packRows[0]?.shop_id ?? 0);
    }

    if (!shopId) {
      throw Object.assign(
        new Error("No pude identificar el stock asociado a este premio."),
        { status: 409 },
      );
    }

    const cardKey = stockCardKey(parseCard(userCard.card_json));
    const [stockRows] = await connection.execute(
      `
        SELECT id, quantity
        FROM shop_card_stock
        WHERE shop_id = ? AND card_key = ?
        LIMIT 1
        FOR UPDATE
      `,
      [shopId, cardKey],
    );
    const stockItem = stockRows[0];

    if (!stockItem || Number(stockItem.quantity ?? 0) <= 0) {
      await connection.execute(
        "UPDATE user_cards SET status = 'waiting_stock' WHERE id = ?",
        [cardId],
      );
      await connection.commit();
      return { ok: true, waitingForStock: true };
    }

    await connection.execute(
      "UPDATE shop_card_stock SET quantity = quantity - 1 WHERE id = ? AND quantity > 0",
      [stockItem.id],
    );
    await connection.execute(
      "UPDATE user_cards SET status = 'withdrawn', shipment_status = 'pending', tracking_number = NULL, shipped_at = NULL, delivered_at = NULL WHERE id = ?",
      [cardId],
    );
    await connection.commit();

    return { ok: true, waitingForStock: false };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function handleRequest(request, response) {
  setCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (!isCsrfSafe(request, config.corsAllowedOrigins, config.sessionCookieName)) {
    sendJson(response, 403, { error: "Origen no permitido." });
    return;
  }

  const url = new URL(request.url ?? "/", "http://localhost");
  const pathname = url.pathname;

  if (request.method === "GET" && pathname === "/health") {
    const connectionPool = await getPool();
    await connectionPool.query("SELECT 1");
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && pathname === "/api/packs") {
    sendJson(response, 200, {
      packs: await listPacks(),
    });
    return;
  }

  if (request.method === "GET" && pathname === "/api/drops") {
    sendJson(response, 200, {
      drops: await listPublicDrops({
        packId: url.searchParams.get("packId") ?? "",
        limit: Number(url.searchParams.get("limit") ?? 12),
      }),
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/auth/login") {
    const body = await readJsonBody(request);
    const limitKey = `${clientIp(request)}:${asTrimmedString(body.username).toLowerCase()}`;
    enforceRateLimit(loginLimiter, limitKey);
    const result = await login(body);
    loginLimiter.reset(limitKey);
    sendSession(response, result);
    return;
  }

  if (request.method === "POST" && pathname === "/api/auth/register") {
    enforceRateLimit(registerLimiter, clientIp(request));
    sendSession(response, await register(await readJsonBody(request)));
    return;
  }

  if (request.method === "POST" && pathname === "/api/auth/logout") {
    const token = getSessionToken(request);

    if (token) {
      await deleteSession(token);
    }

    clearSessionCookie(response);
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && pathname === "/api/me") {
    const session = await requireUser(request);

    if (!session) {
      if (config.sessionCookieName in parseCookies(request.headers.cookie)) {
        clearSessionCookie(response);
      }

      sendJson(response, 401, { error: "Inicia sesion." });
      return;
    }

    // Re-issuing keeps the cookie's Max-Age in step with the sliding session
    // and moves Bearer-only clients onto the cookie.
    setSessionCookie(response, session.token);
    sendJson(response, 200, await getMe(session));
    return;
  }

  if (request.method === "PUT" && pathname === "/api/me") {
    const session = await requireUser(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion." });
      return;
    }

    sendJson(response, 200, await updateMe(session, await readJsonBody(request)));
    return;
  }

  if (request.method === "POST" && pathname === "/api/wallet/topup") {
    const session = await requireUser(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion." });
      return;
    }

    sendJson(response, 200, await topUpWallet(session, await readJsonBody(request)));
    return;
  }

  if (request.method === "GET" && pathname === "/api/me/cards") {
    const session = await requireUser(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion." });
      return;
    }

    sendJson(response, 200, await listUserCards(session));
    return;
  }

  if (request.method === "GET" && pathname === "/api/upgrader") {
    const session = await requireUser(request);
    sendJson(response, 200, await listUpgraderOptions(session));
    return;
  }

  if (request.method === "POST" && pathname === "/api/upgrader/play") {
    const session = await requireUser(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion." });
      return;
    }

    sendJson(response, 200, await playUpgrader(session, await readJsonBody(request)));
    return;
  }

  if (request.method === "GET" && pathname === "/api/changer") {
    const session = await requireUser(request);
    sendJson(response, 200, await listUpgraderOptions(session));
    return;
  }

  if (request.method === "POST" && pathname === "/api/changer/play") {
    const session = await requireUser(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesión." });
      return;
    }

    sendJson(response, 200, await playChanger(session, await readJsonBody(request)));
    return;
  }

  if (
    request.method === "POST" &&
    pathname.startsWith("/api/me/cards/") &&
    pathname.endsWith("/sell")
  ) {
    const session = await requireUser(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion." });
      return;
    }

    const cardId = Number(
      decodeURIComponent(pathname.replace("/api/me/cards/", "").replace("/sell", "")),
    );
    sendJson(response, 200, await sellUserCard(session, cardId));
    return;
  }

  if (
    request.method === "POST" &&
    pathname.startsWith("/api/me/cards/") &&
    pathname.endsWith("/withdraw")
  ) {
    const session = await requireUser(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion." });
      return;
    }

    const cardId = Number(
      decodeURIComponent(
        pathname.replace("/api/me/cards/", "").replace("/withdraw", ""),
      ),
    );
    sendJson(response, 200, await withdrawUserCard(session, cardId));
    return;
  }

  if (request.method === "GET" && pathname === "/api/admin/stock") {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    sendJson(response, 200, { stock: await listShopStock(session) });
    return;
  }

  if (request.method === "GET" && pathname === "/api/admin/orders") {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    sendJson(response, 200, await listShopOrders());
    return;
  }

  if (request.method === "POST" && pathname === "/api/admin/orders/ship") {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    sendJson(
      response,
      200,
      await markShopOrdersShipped(await readJsonBody(request)),
    );
    return;
  }

  if (request.method === "GET" && pathname === "/api/admin/shipments") {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    sendJson(response, 200, await listShopShipments());
    return;
  }

  if (
    request.method === "POST" &&
    pathname === "/api/admin/shipments/deliver"
  ) {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    sendJson(
      response,
      200,
      await markShipmentDelivered(await readJsonBody(request)),
    );
    return;
  }

  if (request.method === "GET" && pathname === "/api/admin/users") {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    sendJson(response, 200, {
      users: await listAdminUsers(url.searchParams.get("query") ?? ""),
    });
    return;
  }

  if (
    request.method === "GET" &&
    /^\/api\/admin\/users\/\d+\/cards$/.test(pathname)
  ) {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    const userId = Number(pathname.split("/")[4]);
    sendJson(response, 200, await listAdminUserCards(userId));
    return;
  }

  if (request.method === "POST" && pathname === "/api/admin/stock") {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    sendJson(response, 200, {
      stock: await addShopStock(session, await readJsonBody(request)),
    });
    return;
  }

  if (request.method === "PUT" && pathname.startsWith("/api/admin/stock/")) {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    const stockId = Number(
      decodeURIComponent(pathname.replace("/api/admin/stock/", "")),
    );
    sendJson(
      response,
      200,
      await updateShopStock(session, stockId, await readJsonBody(request)),
    );
    return;
  }

  if (
    request.method === "POST" &&
    pathname.startsWith("/api/packs/") &&
    pathname.endsWith("/open")
  ) {
    const session = await requireUser(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion." });
      return;
    }

    const packId = decodeURIComponent(
      pathname.replace("/api/packs/", "").replace("/open", ""),
    );
    sendJson(response, 200, await openPackForUser(packId, session));
    return;
  }

  if (request.method === "POST" && pathname === "/api/packs") {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    sendJson(response, 200, {
      pack: await savePack(await readJsonBody(request), session),
    });
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/packs/")) {
    const session = await requireSeller(request);

    if (!session) {
      sendJson(response, 401, { error: "Inicia sesion como administrador." });
      return;
    }

    const packId = decodeURIComponent(pathname.replace("/api/packs/", ""));
    await deletePackForSession(packId, session);
    sendJson(response, 200, { ok: true });
    return;
  }

  sendJson(response, 404, { error: "Ruta no encontrada." });
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    const status = Number.isInteger(error?.status) ? error.status : 500;

    if (status >= 500) {
      console.error(`[${request.method} ${request.url}]`, error);
    }

    if (response.headersSent) {
      response.end();
      return;
    }

    setCorsHeaders(request, response);
    sendJson(response, status, {
      error:
        status < 500 && error instanceof Error
          ? error.message
          : "Error inesperado en el servidor.",
    });
  });
});

await getPool();

if (process.argv.includes("--migrate-only")) {
  console.log("Migraciones de Pullario completadas.");
  await pool.end();
  pool = undefined;
} else {
  await deleteExpiredSessions();
  setInterval(() => {
    deleteExpiredSessions().catch((error) =>
      console.error("No se pudieron limpiar sesiones vencidas:", error),
    );
  }, 1000 * 60 * 60).unref();

  server.listen(config.port, config.host, () => {
    console.log(`Pullario API listo en http://${config.host}:${config.port}`);
  });
}

process.on("SIGINT", async () => {
  if (pool) {
    await pool.end();
  }

  process.exit(0);
});
