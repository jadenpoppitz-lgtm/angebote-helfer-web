import { describe, expect, it } from "vitest";
import {
  DEMO_DAY_DEVICE_RECORDS,
  DEMO_DAY_METAL_KEYS,
  DEMO_DAY_TEST_WINNER_SERIAL,
  lookupDemoDayDevice,
} from "@/data/demoDayDevices";

describe("demo-day device records", () => {
  it("contains 100 unique synthetic serial numbers and exactly five winners", () => {
    expect(DEMO_DAY_DEVICE_RECORDS).toHaveLength(100);
    expect(new Set(DEMO_DAY_DEVICE_RECORDS.map((record) => record.serial)).size).toBe(100);
    expect(DEMO_DAY_DEVICE_RECORDS.filter((record) => record.winner)).toHaveLength(5);
  });

  it("resolves the test winner with compact and lowercase input", () => {
    const compactSerial = DEMO_DAY_TEST_WINNER_SERIAL.replace(/-/g, "").toLowerCase();
    const record = lookupDemoDayDevice(compactSerial);

    expect(record?.serial).toBe(DEMO_DAY_TEST_WINNER_SERIAL);
    expect(record?.winner).toBe(true);
    expect(record?.prizeName).toBeTruthy();
  });

  it("keeps every sourced metal profile internally consistent", () => {
    DEMO_DAY_DEVICE_RECORDS.forEach((record) => {
      const metalKeys = record.metalProfile.map((metal) => metal.key);

      expect(record.weightG).toBeGreaterThan(0);
      expect(record.weightEvidence.url).toMatch(/^https:\/\//);
      expect(record.sources.length).toBeGreaterThanOrEqual(3);
      expect(record.metalProfile.length).toBeGreaterThanOrEqual(15);
      expect(new Set(metalKeys).size).toBe(metalKeys.length);
      expect(metalKeys.every((key) => DEMO_DAY_METAL_KEYS.includes(key))).toBe(true);

      record.metalProfile.forEach((metal) => {
        expect(metal.sourceUrl).toMatch(/^https:\/\//);

        if (metal.grams === null) {
          expect(metal.evidence).toBe("declared");
          expect(metal.rangeG).toBeUndefined();
          return;
        }

        expect(metal.grams).toBeGreaterThanOrEqual(0);
        expect(metal.grams).toBeLessThanOrEqual(record.weightG);

        if (metal.evidence === "research-estimate") {
          expect(metal.rangeG).toBeDefined();
          expect(metal.rangeG?.[0]).toBeLessThanOrEqual(metal.grams);
          expect(metal.rangeG?.[1]).toBeGreaterThanOrEqual(metal.grams);
        } else {
          expect(metal.rangeG).toBeUndefined();
        }
      });

      expect(record.recoverableWeightG).toBeLessThanOrEqual(record.weightG);
      expect(record.recyclablePercent).toBeGreaterThan(0);
      expect(record.recyclablePercent).toBeLessThanOrEqual(100);
    });
  });

  it("uses the documented weight for each exact model configuration", () => {
    const expectedWeights = new Map([
      ["Fairphone 5 5G · 256 GB", 212],
      ["iPhone 13 · 128 GB · A2633", 174],
      ["Galaxy S22 5G · 128 GB · SM-S901B", 167],
      ["ThinkPad T14 Gen 3 · Intel · Thunder Black · 52,5 Wh", 1478],
      ["MacBook Air 13\" · M2 · 256 GB · A2681", 1240],
      ["iPad Air 5 · Wi-Fi · 64 GB · A2588", 461],
      ["Galaxy Tab S8 · Wi-Fi · 128 GB · SM-X700", 503],
      ["Apple Watch Series 8 · 45 mm · Aluminium · GPS", 38.8],
      ["Nintendo Switch · OLED · 64 GB · mit Joy-Con", 420],
      ["WH-1000XM5 · Wireless Headphones", 250],
      ["FRITZ!Box 7590 AX · Wi-Fi 6 · Gerät ohne Netzteil", 590],
      ["OptiPlex 7090 Micro · Core i5 · ROW-Konfiguration", 1180],
    ]);

    expectedWeights.forEach((weight, model) => {
      const record = DEMO_DAY_DEVICE_RECORDS.find((device) => device.model === model);
      expect(record?.weightG).toBe(weight);
    });
  });

  it("preserves Fairphone's published full-material-declaration values", () => {
    const record = DEMO_DAY_DEVICE_RECORDS.find((device) => device.model.startsWith("Fairphone 5"));
    const metalValue = (key: (typeof DEMO_DAY_METAL_KEYS)[number]) =>
      record?.metalProfile.find((metal) => metal.key === key);

    expect(record?.metalMethod).toBe("manufacturer");
    expect(metalValue("aluminum")?.grams).toBeCloseTo(38.6890762, 7);
    expect(metalValue("copper")?.grams).toBeCloseTo(16.851607, 6);
    expect(metalValue("lithium")?.grams).toBeCloseTo(1.465986523, 9);
    expect(metalValue("gold")?.evidence).toBe("manufacturer");
  });

  it("keeps Apple's official minimum disclosures separate from element estimates", () => {
    const record = DEMO_DAY_DEVICE_RECORDS.find((device) => device.model.startsWith("MacBook Air"));

    expect(record?.disclosures).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "precious-metals-minimum", grams: 2.328 }),
      expect.objectContaining({ kind: "rare-earths-minimum", grams: 2.688 }),
    ]));
  });

  it("derives router PCB metals from the cited router study", () => {
    const record = DEMO_DAY_DEVICE_RECORDS.find((device) => device.model.startsWith("FRITZ!Box"));
    const metalValue = (key: (typeof DEMO_DAY_METAL_KEYS)[number]) =>
      record?.metalProfile.find((metal) => metal.key === key);

    expect(metalValue("copper")?.grams).toBeCloseTo(55.814, 3);
    expect(metalValue("gold")?.grams).toBeCloseTo(0.051, 3);
    expect(metalValue("palladium")?.grams).toBeCloseTo(0.005, 3);
    expect(metalValue("lead")?.sourceUrl).toContain("S0921344917300551");
  });

  it("links smartphone precious metals to the experimental precious-metal study", () => {
    const record = DEMO_DAY_DEVICE_RECORDS.find((device) => device.model.startsWith("iPhone 13"));
    const gold = record?.metalProfile.find((metal) => metal.key === "gold");
    const copper = record?.metalProfile.find((metal) => metal.key === "copper");

    expect(gold?.sourceUrl).toContain("acssuschemeng.8b02516");
    expect(copper?.sourceUrl).toContain("S2213343720309520");
  });
});
