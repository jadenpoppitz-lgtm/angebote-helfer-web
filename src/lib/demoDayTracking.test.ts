import { afterEach, describe, expect, it } from "vitest";
import {
  DemoDayTrackingError,
  LOCAL_DEMO_DAY_ADMIN_PASSWORD,
  fetchDemoDayAnalytics,
  trackDemoDayLookup,
  trackDemoDayVisit,
} from "@/lib/demoDayTracking";

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("demo-day tracking", () => {
  it("counts a browser session only once per tab", async () => {
    await trackDemoDayVisit();
    await trackDemoDayVisit();

    const analytics = await fetchDemoDayAnalytics(LOCAL_DEMO_DAY_ADMIN_PASSWORD);
    expect(analytics.summary.sessions).toBe(1);
    expect(analytics.summary.visits).toBe(1);
  });

  it("stores lookup time, normalized serial and result", async () => {
    await trackDemoDayLookup("lt26ab12cd34", true, false);

    const analytics = await fetchDemoDayAnalytics(LOCAL_DEMO_DAY_ADMIN_PASSWORD);
    expect(analytics.summary.lookups).toBe(1);
    expect(analytics.summary.recognized).toBe(1);
    expect(analytics.summary.notFound).toBe(0);
    expect(analytics.events[0]).toMatchObject({
      type: "lookup",
      serial: "LT26-AB12-CD34",
      found: true,
      winner: false,
    });
    expect(Number.isNaN(new Date(analytics.events[0].createdAt).getTime())).toBe(false);
  });

  it("rejects an incorrect local admin password", async () => {
    await expect(fetchDemoDayAnalytics("wrong-password")).rejects.toEqual(
      expect.objectContaining<Partial<DemoDayTrackingError>>({ status: 401 }),
    );
  });
});
