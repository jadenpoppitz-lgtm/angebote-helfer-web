import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

const KEY_PREFIX = process.env.DEMO_DAY_TRACKING_KEY_PREFIX || "leaftronics:demo-day:2026";
const EVENT_LIMIT = 500;
const FALLBACK_ADMIN_PASSWORD_HASH = "b23c819879fc674a5c7376534e50e1707690cff0b0487d7029daca0b3f3c15d3";
const memoryStore = globalThis.__leaftronicsDemoDayTracking ?? {
  metrics: {},
  sessions: new Set(),
  events: [],
};

globalThis.__leaftronicsDemoDayTracking = memoryStore;

function readBody(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  return request.body;
}

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function canUseMemoryStore() {
  return process.env.NODE_ENV !== "production" || process.env.DEMO_DAY_ALLOW_EPHEMERAL_STORAGE === "true";
}

function memoryStorageKind() {
  return process.env.NODE_ENV === "production" ? "ephemeral" : "development";
}

async function runRedisBatch(commands, endpoint = "pipeline") {
  const config = getRedisConfig();
  if (!config) throw new Error("Demo Day tracking storage is not configured");

  const result = await fetch(`${config.url}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!result.ok) {
    throw new Error(`Demo Day tracking storage failed with ${result.status}`);
  }

  return result.json();
}

function normalizeSerial(value) {
  const compact = String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
  return compact.match(/.{1,4}/g)?.join("-") ?? "";
}

function validateEvent(payload) {
  const type = payload.type === "visit" || payload.type === "lookup" ? payload.type : null;
  const sessionId = String(payload.sessionId ?? "").trim();

  if (!type || !/^[A-Za-z0-9-]{8,80}$/.test(sessionId)) return null;

  if (type === "visit") return { type, sessionId };

  const serial = normalizeSerial(payload.serial);
  if (!serial) return null;

  return {
    type,
    sessionId,
    serial,
    found: payload.found === true,
    winner: payload.found === true && payload.winner === true,
  };
}

function secureEqual(value, expected) {
  const left = Buffer.from(String(value ?? ""));
  const right = Buffer.from(String(expected ?? ""));
  return left.length === right.length && timingSafeEqual(left, right);
}

function readAdminPassword(request) {
  const authorization = String(request.headers?.authorization ?? "");
  if (authorization.startsWith("Bearer ")) return authorization.slice(7);
  return String(request.headers?.["x-demo-admin-password"] ?? "");
}

function isAuthorizedAdmin(request) {
  const provided = readAdminPassword(request);
  const configured = process.env.DEMO_DAY_ADMIN_PASSWORD;
  if (configured) return secureEqual(provided, configured);

  const providedHash = createHash("sha256").update(provided).digest("hex");
  return secureEqual(providedHash, FALLBACK_ADMIN_PASSWORD_HASH);
}

function parseHash(value) {
  if (!value) return {};
  if (!Array.isArray(value)) return value;
  return value.reduce((result, entry, index) => {
    if (index % 2 === 0) result[entry] = Number(value[index + 1] ?? 0);
    return result;
  }, {});
}

function numericMetrics(value) {
  const metrics = parseHash(value);
  return {
    visits: Number(metrics.visits ?? 0),
    lookups: Number(metrics.lookups ?? 0),
    recognized: Number(metrics.recognized ?? 0),
    notFound: Number(metrics.notFound ?? 0),
    winnerChecks: Number(metrics.winnerChecks ?? 0),
  };
}

function eventMetricFields(event) {
  if (event.type === "visit") return ["visits"];
  return [
    "lookups",
    event.found ? "recognized" : "notFound",
    ...(event.winner ? ["winnerChecks"] : []),
  ];
}

async function storeEvent(event) {
  const redis = getRedisConfig();
  if (redis) {
    const commands = [
      ...eventMetricFields(event).map((field) => ["HINCRBY", `${KEY_PREFIX}:metrics`, field, "1"]),
      ["SADD", `${KEY_PREFIX}:sessions`, event.sessionId],
      ["LPUSH", `${KEY_PREFIX}:events`, JSON.stringify(event)],
      ["LTRIM", `${KEY_PREFIX}:events`, "0", String(EVENT_LIMIT - 1)],
    ];
    await runRedisBatch(commands, "multi-exec");
    return "persistent";
  }

  if (!canUseMemoryStore()) throw new Error("Demo Day tracking storage is not configured");

  eventMetricFields(event).forEach((field) => {
    memoryStore.metrics[field] = Number(memoryStore.metrics[field] ?? 0) + 1;
  });
  memoryStore.sessions.add(event.sessionId);
  memoryStore.events.unshift(event);
  memoryStore.events = memoryStore.events.slice(0, EVENT_LIMIT);
  return memoryStorageKind();
}

async function readAnalytics() {
  const redis = getRedisConfig();
  if (redis) {
    const result = await runRedisBatch([
      ["HGETALL", `${KEY_PREFIX}:metrics`],
      ["SCARD", `${KEY_PREFIX}:sessions`],
      ["LRANGE", `${KEY_PREFIX}:events`, "0", String(EVENT_LIMIT - 1)],
    ]);
    const metrics = numericMetrics(result?.[0]?.result);
    const events = Array.isArray(result?.[2]?.result)
      ? result[2].result.flatMap((entry) => {
          try {
            return [JSON.parse(entry)];
          } catch {
            return [];
          }
        })
      : [];
    return {
      summary: { ...metrics, sessions: Number(result?.[1]?.result ?? 0) },
      events,
      storage: "persistent",
    };
  }

  if (!canUseMemoryStore()) throw new Error("Demo Day tracking storage is not configured");
  return {
    summary: { ...numericMetrics(memoryStore.metrics), sessions: memoryStore.sessions.size },
    events: memoryStore.events,
    storage: memoryStorageKind(),
  };
}

function setResponseHeaders(response) {
  response.setHeader("Cache-Control", "private, no-store, max-age=0");
  response.setHeader("X-Robots-Tag", "noindex, nofollow");
}

export default async function handler(request, response) {
  setResponseHeaders(response);

  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "GET, POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method === "POST") {
    const validated = validateEvent(readBody(request));
    if (!validated) return response.status(400).json({ error: "Ungültiges Tracking-Ereignis." });

    const event = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...validated,
    };

    try {
      const storage = await storeEvent(event);
      return response.status(202).json({ accepted: true, storage });
    } catch (error) {
      console.error("Demo Day tracking write failed", error);
      return response.status(503).json({ error: "Monitoring-Speicher ist nicht konfiguriert." });
    }
  }

  if (request.method === "GET") {
    if (!isAuthorizedAdmin(request)) {
      return response.status(401).json({ error: "Passwort ist nicht korrekt." });
    }

    try {
      const analytics = await readAnalytics();
      return response.status(200).json({
        ...analytics,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Demo Day tracking read failed", error);
      return response.status(503).json({ error: "Monitoring-Speicher ist nicht konfiguriert." });
    }
  }

  response.setHeader("Allow", "GET, POST, OPTIONS");
  return response.status(405).json({ error: "Method not allowed" });
}
