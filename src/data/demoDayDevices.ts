export type DemoDeviceKind =
  | "desktop"
  | "headphones"
  | "laptop"
  | "network"
  | "phone"
  | "tablet"
  | "watch"
  | "console";

export const DEMO_DAY_METAL_KEYS = [
  "aluminum",
  "ironSteel",
  "copper",
  "cobalt",
  "lithium",
  "nickel",
  "tin",
  "zinc",
  "magnesium",
  "chromium",
  "manganese",
  "tungsten",
  "gold",
  "silver",
  "palladium",
  "platinum",
  "tantalum",
  "indium",
  "antimony",
  "rareEarths",
  "lead",
] as const;

export type DemoDayMetalKey = (typeof DEMO_DAY_METAL_KEYS)[number];
export type DemoDayMetalEvidence = "manufacturer" | "manufacturer-minimum" | "research-estimate" | "declared";
export type DemoDayMetalRecovery = "established" | "specialized" | "limited";
export type DemoDayWeightEvidenceKind = "manufacturer" | "manufacturer-approximate" | "independent-measurement";

export type DemoDaySource = {
  title: string;
  url: string;
};

export type DemoDayMetalEntry = {
  key: DemoDayMetalKey;
  grams: number | null;
  rangeG?: readonly [number, number];
  evidence: DemoDayMetalEvidence;
  recovery: DemoDayMetalRecovery;
  sourceUrl: string;
};

export type DemoDayDisclosure = {
  kind: "precious-metals-minimum" | "rare-earths-minimum";
  grams: number;
  sourceUrl: string;
};

export type DemoDayDeviceRecord = {
  serial: string;
  passportId: string;
  manufacturer: string;
  model: string;
  category: string;
  kind: DemoDeviceKind;
  manufacturedYear: number;
  weightG: number;
  weightEvidence: DemoDaySource & {
    kind: DemoDayWeightEvidenceKind;
  };
  metalProfile: DemoDayMetalEntry[];
  metalMethod: "manufacturer" | "hybrid";
  disclosures: DemoDayDisclosure[];
  sources: DemoDaySource[];
  recyclablePercent: number;
  recoverableWeightG: number;
  avoidedCo2Kg: number;
  recycledBefore: boolean;
  previousCycles: number;
  winner: boolean;
  prizeName: string | null;
};

type DemoDayDeviceTemplate = Pick<
  DemoDayDeviceRecord,
  | "manufacturer"
  | "model"
  | "category"
  | "kind"
  | "manufacturedYear"
  | "weightG"
  | "weightEvidence"
  | "metalProfile"
  | "metalMethod"
  | "disclosures"
  | "sources"
  | "recyclablePercent"
  | "avoidedCo2Kg"
>;

const round = (value: number, precision = 3) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const roundMetalRange = (value: number) =>
  round(value, value < 0.01 ? 6 : value < 1 ? 4 : 3);

const METAL_RECOVERY: Record<DemoDayMetalKey, DemoDayMetalRecovery> = {
  aluminum: "established",
  ironSteel: "established",
  copper: "established",
  cobalt: "specialized",
  lithium: "specialized",
  nickel: "specialized",
  tin: "established",
  zinc: "established",
  magnesium: "limited",
  chromium: "specialized",
  manganese: "specialized",
  tungsten: "limited",
  gold: "established",
  silver: "established",
  palladium: "established",
  platinum: "established",
  tantalum: "limited",
  indium: "limited",
  antimony: "limited",
  rareEarths: "limited",
  lead: "specialized",
};

const exactMetal = (key: DemoDayMetalKey, grams: number, sourceUrl: string): DemoDayMetalEntry => ({
  key,
  grams,
  evidence: "manufacturer",
  recovery: METAL_RECOVERY[key],
  sourceUrl,
});

const minimumMetal = (key: DemoDayMetalKey, grams: number, sourceUrl: string): DemoDayMetalEntry => ({
  key,
  grams,
  evidence: "manufacturer-minimum",
  recovery: METAL_RECOVERY[key],
  sourceUrl,
});

const declaredMetal = (key: DemoDayMetalKey, sourceUrl: string): DemoDayMetalEntry => ({
  key,
  grams: null,
  evidence: "declared",
  recovery: METAL_RECOVERY[key],
  sourceUrl,
});

const estimatedMetals = (
  values: Partial<Record<DemoDayMetalKey, number>>,
  sourceUrl: string,
  range = 0.35,
  sourceOverrides: Partial<Record<DemoDayMetalKey, string>> = {},
): DemoDayMetalEntry[] =>
  DEMO_DAY_METAL_KEYS.flatMap((key) => {
    const grams = values[key];
    if (grams === undefined) return [];
    const minimum = Math.max(0, grams * (1 - range));
    const maximum = grams * (1 + range);
    return [{
      key,
      grams,
      rangeG: [roundMetalRange(minimum), roundMetalRange(maximum)] as const,
      evidence: "research-estimate" as const,
      recovery: METAL_RECOVERY[key],
      sourceUrl: sourceOverrides[key] ?? sourceUrl,
    }];
  });

const orderedMetals = (entries: DemoDayMetalEntry[]) =>
  DEMO_DAY_METAL_KEYS.flatMap((key) => entries.filter((entry) => entry.key === key));

const FAIRPHONE_REPORT = "https://www.fairphone.com/wp-content/uploads/2024/06/Fairphone-2023-Impact-Report-.pdf";
const FAIRPHONE_RECYCLING = "https://www.fairphone.com/wp-content/uploads/2023/12/Fairphone-5-Information-on-how-to-repair-and-recycle.pdf";
const FAIRPHONE_WEIGHT = "https://www.fairphone.com/wp-content/uploads/2024/09/Fairphone5_LCA_Report_2024.pdf";
const IPHONE_SPECS = "https://support.apple.com/de-de/111872";
const IPHONE_ENVIRONMENT = "https://www.apple.com/my/environment/pdf/products/iphone/iPhone_13_PER_Sept2021.pdf";
const MACBOOK_SPECS = "https://support.apple.com/en-gb/111867";
const MACBOOK_DISCLOSURE = "https://regulatoryinfo.apple.com/environmentalcharacteristics/63c705465caeb661ebfc3ba7";
const IPAD_SPECS = "https://support.apple.com/de-de/111887";
const WATCH_SPECS = "https://support.apple.com/de-de/111848";
const WATCH_ENVIRONMENT = "https://www.apple.com/cl/environment/pdf/products/watch/Apple_Watch_Series8_PER_Sept2022.pdf";
const S22_SPECS = "https://www.samsung.com/es/smartphones/galaxy-s/galaxy-s22-graphite-128gb-sm-s901bzadeub/";
const TAB_S8_SPECS = "https://www.samsung.com/mx/tablets/galaxy-tab-s/galaxy-tab-s8-wifi-graphite-128gb-sm-x700nzalmxo/";
const SAMSUNG_SUSTAINABILITY = "https://csr.samsung.com/data/Sustainability_report_2022_en.pdf";
const THINKPAD_SPECS = "https://psref.lenovo.com/syspool/Sys/PDF/ThinkPad/ThinkPad_T14_Gen_3_Intel/ThinkPad_T14_Gen_3_Intel_Spec.html";
const SWITCH_SPECS = "https://en-americas-support.nintendo.com/app/answers/detail/a_id/55834/";
const SONY_SPECS = "https://www.sony.com/electronics/support/wireless-headphones-bluetooth-headphones/wh-1000xm5/specifications";
const FRITZ_WEIGHT = "https://avm.de/fileadmin/user_upload/Global/Verschiedenes/2023/Stiftung_Warentest/Stiftung_Warentest_Router-Mesh-WLAN-test-02-2023.pdf";
const FRITZ_SPECS = "https://fritz.com/en/products/fritz-box-7590-ax-20002998";
const DELL_SPECS = "https://www.dell.com/community/assets/community/687062f5-603c-4f5f-ab9d-31aa7cacb376/optiplex7090specsheet-c31af61f-f6ac-4b5a-b23e-9cc2c88ecaab-182597965.pdf";
const SMARTPHONE_METALS = "https://pmc.ncbi.nlm.nih.gov/articles/PMC7577977/";
const SMARTPHONE_PRECIOUS_METALS = "https://pubs.acs.org/doi/10.1021/acssuschemeng.8b02516";
const SMARTPHONE_COMPONENT_METALS = "https://www.sciencedirect.com/science/article/pii/S2213343720309520";
const LAPTOP_METALS = "https://onemine.org/documents/characterization-and-evaluation-of-recycling-potential-for-discarded-laptops-mining-metallurgy-exploration-2021-";
const ROUTER_METALS = "https://www.sciencedirect.com/science/article/abs/pii/S0921344917300551";
const RECYCLING_ROUTES = "https://www.fairphone.com/wp-content/uploads/2021/11/3.FairphoneRecyclabilityReport022017-1.pdf";

const smartphoneSourceOverrides: Partial<Record<DemoDayMetalKey, string>> = {
  cobalt: SMARTPHONE_METALS,
  antimony: SMARTPHONE_METALS,
  gold: SMARTPHONE_PRECIOUS_METALS,
  silver: SMARTPHONE_PRECIOUS_METALS,
  palladium: SMARTPHONE_PRECIOUS_METALS,
  platinum: SMARTPHONE_METALS,
  rareEarths: SMARTPHONE_METALS,
};

const smartphoneSources = (weightTitle: string, weightUrl: string, materialTitle: string, materialUrl: string): DemoDaySource[] => [
  { title: weightTitle, url: weightUrl },
  { title: materialTitle, url: materialUrl },
  { title: "Elementanalyse von Smartphone-Komponenten", url: SMARTPHONE_COMPONENT_METALS },
  { title: "Analyse kritischer Smartphone-Metalle", url: SMARTPHONE_METALS },
  { title: "Experimentelle Edelmetallanalyse", url: SMARTPHONE_PRECIOUS_METALS },
  { title: "Recyclingwege und Rückgewinnungsgrenzen", url: RECYCLING_ROUTES },
];

const deviceTemplates: DemoDayDeviceTemplate[] = [
  {
    manufacturer: "Fairphone",
    model: "Fairphone 5 5G · 256 GB",
    category: "Smartphone",
    kind: "phone",
    manufacturedYear: 2024,
    weightG: 212,
    weightEvidence: { kind: "manufacturer", title: "Fraunhofer IZM · Fairphone 5 LCA", url: FAIRPHONE_WEIGHT },
    metalProfile: orderedMetals([
      exactMetal("aluminum", 38.6890762, FAIRPHONE_REPORT),
      declaredMetal("ironSteel", FAIRPHONE_RECYCLING),
      exactMetal("copper", 16.851607, FAIRPHONE_REPORT),
      exactMetal("cobalt", 12.3191, FAIRPHONE_REPORT),
      exactMetal("lithium", 1.465986523, FAIRPHONE_REPORT),
      exactMetal("nickel", 3.048709, FAIRPHONE_REPORT),
      exactMetal("tin", 0.86695971, FAIRPHONE_REPORT),
      exactMetal("zinc", 1.0330573, FAIRPHONE_REPORT),
      exactMetal("magnesium", 4.9554830706, FAIRPHONE_REPORT),
      exactMetal("tungsten", 0.7451726, FAIRPHONE_REPORT),
      exactMetal("gold", 0.0227697, FAIRPHONE_REPORT),
      exactMetal("silver", 0.0833276, FAIRPHONE_REPORT),
      declaredMetal("tantalum", FAIRPHONE_RECYCLING),
      exactMetal("indium", 0.0005173642, FAIRPHONE_REPORT),
      exactMetal("rareEarths", 0.15017897, FAIRPHONE_REPORT),
    ]),
    metalMethod: "manufacturer",
    disclosures: [],
    sources: [
      { title: "Fairphone 2023 Impact Report · Material use", url: FAIRPHONE_REPORT },
      { title: "Fairphone 5 · Informationen für Recycler", url: FAIRPHONE_RECYCLING },
      { title: "Recyclingwege und Rückgewinnungsgrenzen", url: RECYCLING_ROUTES },
    ],
    recyclablePercent: 86,
    avoidedCo2Kg: 9.4,
  },
  {
    manufacturer: "Apple",
    model: "iPhone 13 · 128 GB · A2633",
    category: "Smartphone",
    kind: "phone",
    manufacturedYear: 2022,
    weightG: 174,
    weightEvidence: { kind: "manufacturer", title: "Apple · iPhone 13 Technische Daten", url: IPHONE_SPECS },
    metalProfile: estimatedMetals({
      aluminum: 32,
      ironSteel: 12,
      copper: 15.2,
      cobalt: 6.8,
      lithium: 0.61,
      nickel: 1.8,
      tin: 1.1,
      zinc: 0.4,
      magnesium: 1.8,
      chromium: 2.2,
      manganese: 0.5,
      tungsten: 0.65,
      gold: 0.033,
      silver: 0.301,
      palladium: 0.007,
      platinum: 0.004,
      tantalum: 0.031,
      indium: 0.0001,
      antimony: 0.091,
      rareEarths: 0.07,
    }, SMARTPHONE_COMPONENT_METALS, 0.35, smartphoneSourceOverrides),
    metalMethod: "hybrid",
    disclosures: [],
    sources: smartphoneSources("Apple · iPhone 13 Technische Daten", IPHONE_SPECS, "Apple · iPhone 13 Umweltbericht", IPHONE_ENVIRONMENT),
    recyclablePercent: 84,
    avoidedCo2Kg: 8.2,
  },
  {
    manufacturer: "Samsung",
    model: "Galaxy S22 5G · 128 GB · SM-S901B",
    category: "Smartphone",
    kind: "phone",
    manufacturedYear: 2022,
    weightG: 167,
    weightEvidence: { kind: "manufacturer", title: "Samsung · Galaxy S22 Spezifikation", url: S22_SPECS },
    metalProfile: estimatedMetals({
      aluminum: 31.5,
      ironSteel: 15.5,
      copper: 14.6,
      cobalt: 6.6,
      lithium: 0.58,
      nickel: 1.7,
      tin: 1.04,
      zinc: 0.38,
      magnesium: 1.7,
      chromium: 2.1,
      manganese: 0.48,
      tungsten: 0.62,
      gold: 0.032,
      silver: 0.289,
      palladium: 0.0067,
      platinum: 0.004,
      tantalum: 0.03,
      indium: 0.0001,
      antimony: 0.088,
      rareEarths: 0.065,
    }, SMARTPHONE_COMPONENT_METALS, 0.35, smartphoneSourceOverrides),
    metalMethod: "hybrid",
    disclosures: [],
    sources: smartphoneSources("Samsung · Galaxy S22 Spezifikation", S22_SPECS, "Samsung Electronics Sustainability Report 2022", SAMSUNG_SUSTAINABILITY),
    recyclablePercent: 83,
    avoidedCo2Kg: 7.8,
  },
  {
    manufacturer: "Lenovo",
    model: "ThinkPad T14 Gen 3 · Intel · Thunder Black · 52,5 Wh",
    category: "Business-Laptop",
    kind: "laptop",
    manufacturedYear: 2023,
    weightG: 1478,
    weightEvidence: { kind: "manufacturer-approximate", title: "Lenovo PSREF · T14 Gen 3 Intel", url: THINKPAD_SPECS },
    metalProfile: estimatedMetals({
      aluminum: 80,
      ironSteel: 150,
      copper: 140,
      cobalt: 24,
      lithium: 4.8,
      nickel: 9,
      tin: 7,
      zinc: 3,
      magnesium: 12,
      chromium: 12,
      manganese: 4,
      tungsten: 1,
      gold: 0.08,
      silver: 0.2,
      palladium: 0.015,
      platinum: 0.004,
      tantalum: 0.12,
      indium: 0.015,
      antimony: 0.2,
      rareEarths: 0.5,
      lead: 0.5,
    }, LAPTOP_METALS, 0.4),
    metalMethod: "hybrid",
    disclosures: [],
    sources: [
      { title: "Lenovo PSREF · Gewicht und Gehäusevariante", url: THINKPAD_SPECS },
      { title: "Charakterisierung ausgedienter Laptops", url: LAPTOP_METALS },
      { title: "Recyclingwege und Rückgewinnungsgrenzen", url: RECYCLING_ROUTES },
    ],
    recyclablePercent: 91,
    avoidedCo2Kg: 42,
  },
  {
    manufacturer: "Apple",
    model: "MacBook Air 13\" · M2 · 256 GB · A2681",
    category: "Notebook",
    kind: "laptop",
    manufacturedYear: 2023,
    weightG: 1240,
    weightEvidence: { kind: "manufacturer", title: "Apple · MacBook Air M2 Technische Daten", url: MACBOOK_SPECS },
    metalProfile: orderedMetals([
      ...estimatedMetals({
        aluminum: 555,
        ironSteel: 55,
        copper: 95,
        cobalt: 20,
        lithium: 4.5,
        nickel: 8,
        tin: 4,
        zinc: 2,
        magnesium: 5,
        chromium: 5,
        manganese: 2,
        tungsten: 1.5,
        tantalum: 0.1,
        indium: 0.01,
        antimony: 0.12,
      }, LAPTOP_METALS, 0.35),
      declaredMetal("gold", MACBOOK_DISCLOSURE),
      declaredMetal("silver", MACBOOK_DISCLOSURE),
      declaredMetal("palladium", MACBOOK_DISCLOSURE),
      declaredMetal("platinum", MACBOOK_DISCLOSURE),
      minimumMetal("rareEarths", 2.688, MACBOOK_DISCLOSURE),
      declaredMetal("lead", MACBOOK_DISCLOSURE),
    ]),
    metalMethod: "hybrid",
    disclosures: [
      { kind: "precious-metals-minimum", grams: 2.328, sourceUrl: MACBOOK_DISCLOSURE },
      { kind: "rare-earths-minimum", grams: 2.688, sourceUrl: MACBOOK_DISCLOSURE },
    ],
    sources: [
      { title: "Apple · Gewicht und Materialangaben", url: MACBOOK_SPECS },
      { title: "Apple AGEC · offizielle Mindestmengen", url: MACBOOK_DISCLOSURE },
      { title: "Charakterisierung ausgedienter Laptops", url: LAPTOP_METALS },
      { title: "Recyclingwege und Rückgewinnungsgrenzen", url: RECYCLING_ROUTES },
    ],
    recyclablePercent: 92,
    avoidedCo2Kg: 51,
  },
  {
    manufacturer: "Apple",
    model: "iPad Air 5 · Wi-Fi · 64 GB · A2588",
    category: "Tablet",
    kind: "tablet",
    manufacturedYear: 2022,
    weightG: 461,
    weightEvidence: { kind: "manufacturer", title: "Apple · iPad Air 5 Technische Daten", url: IPAD_SPECS },
    metalProfile: estimatedMetals({
      aluminum: 178,
      ironSteel: 28,
      copper: 31,
      cobalt: 15,
      lithium: 3,
      nickel: 5,
      tin: 1.8,
      zinc: 0.8,
      magnesium: 4,
      chromium: 4,
      manganese: 1.2,
      tungsten: 0.8,
      gold: 0.06,
      silver: 0.2,
      palladium: 0.01,
      platinum: 0.003,
      tantalum: 0.06,
      indium: 0.001,
      antimony: 0.08,
      rareEarths: 0.9,
    }, SMARTPHONE_COMPONENT_METALS, 0.4, smartphoneSourceOverrides),
    metalMethod: "hybrid",
    disclosures: [],
    sources: smartphoneSources("Apple · iPad Air 5 Technische Daten", IPAD_SPECS, "Apple · iPad Air 5 Umweltangaben", IPAD_SPECS),
    recyclablePercent: 88,
    avoidedCo2Kg: 16,
  },
  {
    manufacturer: "Samsung",
    model: "Galaxy Tab S8 · Wi-Fi · 128 GB · SM-X700",
    category: "Tablet",
    kind: "tablet",
    manufacturedYear: 2022,
    weightG: 503,
    weightEvidence: { kind: "manufacturer", title: "Samsung · Galaxy Tab S8 Spezifikation", url: TAB_S8_SPECS },
    metalProfile: estimatedMetals({
      aluminum: 169,
      ironSteel: 32,
      copper: 34,
      cobalt: 17,
      lithium: 3.4,
      nickel: 5.5,
      tin: 2,
      zinc: 0.9,
      magnesium: 4.5,
      chromium: 4.5,
      manganese: 1.4,
      tungsten: 0.9,
      gold: 0.065,
      silver: 0.22,
      palladium: 0.011,
      platinum: 0.003,
      tantalum: 0.065,
      indium: 0.001,
      antimony: 0.09,
      rareEarths: 1,
    }, SMARTPHONE_COMPONENT_METALS, 0.4, smartphoneSourceOverrides),
    metalMethod: "hybrid",
    disclosures: [],
    sources: smartphoneSources("Samsung · Galaxy Tab S8 Spezifikation", TAB_S8_SPECS, "Samsung Electronics Sustainability Report 2022", SAMSUNG_SUSTAINABILITY),
    recyclablePercent: 87,
    avoidedCo2Kg: 15,
  },
  {
    manufacturer: "Apple",
    model: "Apple Watch Series 8 · 45 mm · Aluminium · GPS",
    category: "Smartwatch",
    kind: "watch",
    manufacturedYear: 2023,
    weightG: 38.8,
    weightEvidence: { kind: "manufacturer", title: "Apple · Watch Series 8 Technische Daten", url: WATCH_SPECS },
    metalProfile: estimatedMetals({
      aluminum: 14.1,
      ironSteel: 3.8,
      copper: 3.3,
      cobalt: 1.5,
      lithium: 0.32,
      nickel: 0.7,
      tin: 0.25,
      zinc: 0.1,
      magnesium: 0.2,
      chromium: 0.8,
      manganese: 0.1,
      tungsten: 0.25,
      gold: 0.012,
      silver: 0.06,
      palladium: 0.002,
      platinum: 0.001,
      tantalum: 0.008,
      indium: 0.00005,
      antimony: 0.01,
      rareEarths: 0.18,
    }, SMARTPHONE_COMPONENT_METALS, 0.45, smartphoneSourceOverrides),
    metalMethod: "hybrid",
    disclosures: [],
    sources: smartphoneSources("Apple · Watch Series 8 Technische Daten", WATCH_SPECS, "Apple · Watch Series 8 Umweltbericht", WATCH_ENVIRONMENT),
    recyclablePercent: 79,
    avoidedCo2Kg: 3.1,
  },
  {
    manufacturer: "Nintendo",
    model: "Nintendo Switch · OLED · 64 GB · mit Joy-Con",
    category: "Spielekonsole",
    kind: "console",
    manufacturedYear: 2023,
    weightG: 420,
    weightEvidence: { kind: "manufacturer-approximate", title: "Nintendo · Switch OLED Übersicht", url: SWITCH_SPECS },
    metalProfile: estimatedMetals({
      aluminum: 74,
      ironSteel: 52,
      copper: 31,
      cobalt: 7,
      lithium: 1.5,
      nickel: 3,
      tin: 2,
      zinc: 1.2,
      magnesium: 5,
      chromium: 4,
      manganese: 1,
      tungsten: 0.6,
      gold: 0.07,
      silver: 0.35,
      palladium: 0.015,
      platinum: 0.004,
      tantalum: 0.04,
      indium: 0.001,
      antimony: 0.08,
      rareEarths: 1.2,
      lead: 0.2,
    }, SMARTPHONE_COMPONENT_METALS, 0.45, smartphoneSourceOverrides),
    metalMethod: "hybrid",
    disclosures: [],
    sources: [
      { title: "Nintendo · Gewicht mit Joy-Con", url: SWITCH_SPECS },
      { title: "Elementanalyse kleiner Elektronikgeräte", url: SMARTPHONE_COMPONENT_METALS },
      { title: "Analyse kritischer Elektronikmetalle", url: SMARTPHONE_METALS },
      { title: "Experimentelle Edelmetallanalyse", url: SMARTPHONE_PRECIOUS_METALS },
      { title: "Recyclingwege und Rückgewinnungsgrenzen", url: RECYCLING_ROUTES },
    ],
    recyclablePercent: 86,
    avoidedCo2Kg: 12,
  },
  {
    manufacturer: "Sony",
    model: "WH-1000XM5 · Wireless Headphones",
    category: "Kopfhörer",
    kind: "headphones",
    manufacturedYear: 2023,
    weightG: 250,
    weightEvidence: { kind: "manufacturer-approximate", title: "Sony · WH-1000XM5 Spezifikation", url: SONY_SPECS },
    metalProfile: estimatedMetals({
      aluminum: 15,
      ironSteel: 18,
      copper: 14,
      cobalt: 4.5,
      lithium: 0.9,
      nickel: 2,
      tin: 0.8,
      zinc: 0.4,
      magnesium: 1,
      chromium: 2,
      manganese: 0.3,
      tungsten: 0.1,
      gold: 0.01,
      silver: 0.06,
      palladium: 0.002,
      platinum: 0.001,
      tantalum: 0.01,
      indium: 0.0001,
      antimony: 0.02,
      rareEarths: 2.2,
      lead: 0.02,
    }, SMARTPHONE_COMPONENT_METALS, 0.45, smartphoneSourceOverrides),
    metalMethod: "hybrid",
    disclosures: [],
    sources: [
      { title: "Sony · Gewicht, Neodym-Magnet und vergoldeter Stecker", url: SONY_SPECS },
      { title: "Elementanalyse kleiner Elektronikgeräte", url: SMARTPHONE_COMPONENT_METALS },
      { title: "Analyse kritischer Elektronikmetalle", url: SMARTPHONE_METALS },
      { title: "Experimentelle Edelmetallanalyse", url: SMARTPHONE_PRECIOUS_METALS },
      { title: "Recyclingwege und Rückgewinnungsgrenzen", url: RECYCLING_ROUTES },
    ],
    recyclablePercent: 76,
    avoidedCo2Kg: 4.8,
  },
  {
    manufacturer: "AVM",
    model: "FRITZ!Box 7590 AX · Wi-Fi 6 · Gerät ohne Netzteil",
    category: "Netzwerkgerät",
    kind: "network",
    manufacturedYear: 2023,
    weightG: 590,
    weightEvidence: { kind: "independent-measurement", title: "Stiftung Warentest · Routertest 02/2023", url: FRITZ_WEIGHT },
    metalProfile: estimatedMetals({
      aluminum: 14,
      ironSteel: 13,
      copper: 55.814,
      nickel: 2,
      tin: 9,
      zinc: 2,
      magnesium: 1,
      chromium: 0.128,
      manganese: 0.1,
      tungsten: 0.2,
      gold: 0.051,
      silver: 0.308,
      palladium: 0.005,
      platinum: 0.005,
      tantalum: 0.05,
      indium: 0.001,
      antimony: 0.1,
      rareEarths: 0.2,
      lead: 0.866,
    }, ROUTER_METALS, 0.45),
    metalMethod: "hybrid",
    disclosures: [],
    sources: [
      { title: "Stiftung Warentest · gemessenes Gerätegewicht", url: FRITZ_WEIGHT },
      { title: "FRITZ! · technische Gerätespezifikation", url: FRITZ_SPECS },
      { title: "Laboranalyse von Router-Leiterplatten", url: ROUTER_METALS },
      { title: "Recyclingwege und Rückgewinnungsgrenzen", url: RECYCLING_ROUTES },
    ],
    recyclablePercent: 78,
    avoidedCo2Kg: 8.5,
  },
  {
    manufacturer: "Dell",
    model: "OptiPlex 7090 Micro · Core i5 · ROW-Konfiguration",
    category: "Desktop-PC",
    kind: "desktop",
    manufacturedYear: 2022,
    weightG: 1180,
    weightEvidence: { kind: "manufacturer", title: "Dell · OptiPlex 7090 Micro Spec Sheet", url: DELL_SPECS },
    metalProfile: estimatedMetals({
      aluminum: 221,
      ironSteel: 318,
      copper: 128,
      cobalt: 0.05,
      lithium: 0.03,
      nickel: 5,
      tin: 8,
      zinc: 5,
      magnesium: 6,
      chromium: 25,
      manganese: 5,
      tungsten: 1,
      gold: 0.15,
      silver: 0.35,
      palladium: 0.03,
      platinum: 0.005,
      tantalum: 0.15,
      indium: 0.01,
      antimony: 0.3,
      rareEarths: 1.2,
      lead: 1,
    }, LAPTOP_METALS, 0.4),
    metalMethod: "hybrid",
    disclosures: [],
    sources: [
      { title: "Dell · OptiPlex 7090 Micro Gewicht", url: DELL_SPECS },
      { title: "Charakterisierung kompakter Computer", url: LAPTOP_METALS },
      { title: "Recyclingwege und Rückgewinnungsgrenzen", url: RECYCLING_ROUTES },
    ],
    recyclablePercent: 91,
    avoidedCo2Kg: 38,
  },
];

const winnerSerialByIndex: Record<number, string> = {
  0: "LT26-N7Q4-K9M2",
  23: "LT26-R8C3-X5P7",
  47: "LT26-H4V9-T2L6",
  71: "LT26-W6D2-Q8F4",
  95: "LT26-P3M7-Z9K5",
};

const SERIAL_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

const encodeSerialToken = (value: number, length: number) => {
  let current = value >>> 0;
  let token = "";
  for (let index = 0; index < length; index += 1) {
    token = SERIAL_ALPHABET[current % SERIAL_ALPHABET.length] + token;
    current = Math.floor(current / SERIAL_ALPHABET.length);
  }
  return token;
};

const createSerial = (index: number) => {
  const firstHash = Math.imul(index + 11, 0x45d9f3b) >>> 0;
  const secondHash = Math.imul(index + 37, 0x27d4eb2d) >>> 0;
  return `LT26-${encodeSerialToken(firstHash, 4)}-${encodeSerialToken(index, 2)}${encodeSerialToken(secondHash, 2)}`;
};

export const DEMO_DAY_DEVICE_RECORDS: DemoDayDeviceRecord[] = Array.from({ length: 100 }, (_, index) => {
  const template = deviceTemplates[(index * 7 + 2) % deviceTemplates.length];
  const previousCycles = index % 4 === 0 ? 2 : index % 3 === 0 ? 1 : 0;
  const winnerSerial = winnerSerialByIndex[index];

  return {
    ...template,
    serial: winnerSerial ?? createSerial(index),
    passportId: `DMP-26-${String(index + 1).padStart(4, "0")}`,
    recoverableWeightG: round((template.weightG * template.recyclablePercent) / 100, 1),
    recycledBefore: previousCycles > 0,
    previousCycles,
    winner: Boolean(winnerSerial),
    prizeName: winnerSerial ? "Leaftronics Demo Gold Bar" : null,
  };
});

const deviceLookup = new Map<string, DemoDayDeviceRecord>();

export const normalizeDemoDaySerial = (value: string) =>
  value.trim().toUpperCase().replace(/[–—]/g, "-").replace(/\s+/g, "");

DEMO_DAY_DEVICE_RECORDS.forEach((record) => {
  const normalized = normalizeDemoDaySerial(record.serial);
  deviceLookup.set(normalized, record);
  deviceLookup.set(normalized.replace(/-/g, ""), record);
});

export const lookupDemoDayDevice = (value: string) => {
  const normalized = normalizeDemoDaySerial(value);
  return deviceLookup.get(normalized) ?? deviceLookup.get(normalized.replace(/-/g, "")) ?? null;
};

export const DEMO_DAY_TEST_WINNER_SERIAL = winnerSerialByIndex[0];
export const DEMO_DAY_EXAMPLE_SERIAL = DEMO_DAY_DEVICE_RECORDS.find((record) => !record.winner)?.serial ?? "";
