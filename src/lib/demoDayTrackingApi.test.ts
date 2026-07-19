import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/demo-day-tracking.js";

type MockResult = {
  status: number;
  body: Record<string, unknown> | null;
};

function request(
  method: "GET" | "POST",
  options: { password?: string; body?: Record<string, unknown> } = {},
): Promise<MockResult> {
  return new Promise((resolve) => {
    let status = 200;
    const response = {
      setHeader: vi.fn(),
      status(nextStatus: number) {
        status = nextStatus;
        return this;
      },
      json(body: Record<string, unknown>) {
        resolve({ status, body });
        return this;
      },
      end() {
        resolve({ status, body: null });
        return this;
      },
    };

    void handler(
      {
        method,
        headers: options.password ? { authorization: `Bearer ${options.password}` } : {},
        body: options.body,
      },
      response,
    );
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("demo-day tracking API", () => {
  it("rejects an incorrect production password", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_DAY_ADMIN_PASSWORD", "configured-test-password");
    vi.stubEnv("DEMO_DAY_ALLOW_EPHEMERAL_STORAGE", "true");

    const result = await request("GET", { password: "wrong-password" });

    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: "Passwort ist nicht korrekt." });
  });

  it("records and returns events through the production fallback", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_DAY_ADMIN_PASSWORD", "configured-test-password");
    vi.stubEnv("DEMO_DAY_ALLOW_EPHEMERAL_STORAGE", "true");
    const sessionId = `test-${Date.now()}`;

    const writeResult = await request("POST", {
      body: { type: "visit", sessionId },
    });
    const readResult = await request("GET", { password: "configured-test-password" });

    expect(writeResult).toEqual({ status: 202, body: { accepted: true, storage: "ephemeral" } });
    expect(readResult.status).toBe(200);
    expect(readResult.body).toMatchObject({
      storage: "ephemeral",
      summary: { visits: expect.any(Number), sessions: expect.any(Number) },
    });
  });
});
