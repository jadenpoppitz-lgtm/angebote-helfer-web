import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequest, type RequestPayload } from "@/lib/api";

const payload: RequestPayload = {
  material: "Metall",
  quantity: "500 kg",
  plz: "10115",
  pickup: "Abholung",
  name: "Test User",
  email: "test@example.com",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createRequest", () => {
  it("uses a local demo response when the dev server has no JSON API route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<!doctype html>", { status: 404, headers: { "Content-Type": "text/html" } })),
    );

    const result = await createRequest(payload);

    expect(result.request.id).toMatch(/^DEMO-/);
    expect(result.request.status).toBe("local-demo");
  });

  it("keeps API validation errors visible", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "Bitte pruefen Sie die Eingaben." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    await expect(createRequest(payload)).rejects.toThrow("Bitte pruefen Sie die Eingaben.");
  });
});
