export type DemoDayTrackingEvent = {
  id: string;
  type: "visit" | "lookup";
  sessionId: string;
  createdAt: string;
  serial?: string;
  found?: boolean;
  winner?: boolean;
};

export type DemoDayTrackingSummary = {
  sessions: number;
  visits: number;
  lookups: number;
  recognized: number;
  notFound: number;
  winnerChecks: number;
};

export type DemoDayAnalytics = {
  summary: DemoDayTrackingSummary;
  events: DemoDayTrackingEvent[];
  storage: "persistent" | "development";
  generatedAt: string;
};

export class DemoDayTrackingError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DemoDayTrackingError";
    this.status = status;
  }
}

const LOCAL_EVENTS_KEY = "leaftronics-demo-day-events-v1";
const SESSION_ID_KEY = "leaftronics-demo-day-session-v1";
const VISIT_TRACKED_KEY = "leaftronics-demo-day-visit-v1";
export const LOCAL_DEMO_DAY_ADMIN_PASSWORD = "leaftronics-demo";

let volatileSessionId = "";
let volatileEvents: DemoDayTrackingEvent[] = [];

const isLocalRuntime = () =>
  typeof window !== "undefined" && ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const createSessionId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const getSessionId = () => {
  if (volatileSessionId) return volatileSessionId;
  try {
    const stored = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (stored) return (volatileSessionId = stored);
    const next = createSessionId();
    window.sessionStorage.setItem(SESSION_ID_KEY, next);
    return (volatileSessionId = next);
  } catch {
    return (volatileSessionId = createSessionId());
  }
};

const normalizeSerial = (value: string) => {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return compact.match(/.{1,4}/g)?.join("-") ?? "";
};

const readLocalEvents = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_EVENTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as DemoDayTrackingEvent[]) : [];
  } catch {
    return volatileEvents;
  }
};

const writeLocalEvent = (event: DemoDayTrackingEvent) => {
  const events = [event, ...readLocalEvents()].slice(0, 500);
  volatileEvents = events;
  try {
    window.localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch {
    // Keep the current browser session usable when local storage is blocked.
  }
};

const postTrackingEvent = async (event: Omit<DemoDayTrackingEvent, "id" | "createdAt">) => {
  if (isLocalRuntime()) {
    writeLocalEvent({
      ...event,
      id: createSessionId(),
      createdAt: new Date().toISOString(),
    });
    return;
  }

  try {
    await fetch("/api/demo-day-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    // Monitoring must never interrupt the public demo flow.
  }
};

export async function trackDemoDayVisit() {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(VISIT_TRACKED_KEY)) return;
    window.sessionStorage.setItem(VISIT_TRACKED_KEY, "1");
  } catch {
    // A blocked session store only means that a later mount may count again.
  }
  await postTrackingEvent({ type: "visit", sessionId: getSessionId() });
}

export async function trackDemoDayLookup(serial: string, found: boolean, winner: boolean) {
  if (typeof window === "undefined") return;
  await postTrackingEvent({
    type: "lookup",
    sessionId: getSessionId(),
    serial: normalizeSerial(serial),
    found,
    winner: found && winner,
  });
}

function buildLocalAnalytics(): DemoDayAnalytics {
  const events = readLocalEvents();
  const sessions = new Set(events.map((event) => event.sessionId)).size;
  const lookupEvents = events.filter((event) => event.type === "lookup");
  return {
    summary: {
      sessions,
      visits: events.filter((event) => event.type === "visit").length,
      lookups: lookupEvents.length,
      recognized: lookupEvents.filter((event) => event.found).length,
      notFound: lookupEvents.filter((event) => !event.found).length,
      winnerChecks: lookupEvents.filter((event) => event.winner).length,
    },
    events,
    storage: "development",
    generatedAt: new Date().toISOString(),
  };
}

export async function fetchDemoDayAnalytics(password: string): Promise<DemoDayAnalytics> {
  if (isLocalRuntime()) {
    if (password !== LOCAL_DEMO_DAY_ADMIN_PASSWORD) {
      throw new DemoDayTrackingError("Passwort ist nicht korrekt.", 401);
    }
    return buildLocalAnalytics();
  }

  const response = await fetch("/api/demo-day-tracking", {
    method: "GET",
    headers: { Authorization: `Bearer ${password}` },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as Partial<DemoDayAnalytics> & { error?: string };
  if (!response.ok) {
    throw new DemoDayTrackingError(payload.error ?? "Monitoring konnte nicht geladen werden.", response.status);
  }
  return payload as DemoDayAnalytics;
}
