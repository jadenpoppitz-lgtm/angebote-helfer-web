export type DeviceClass = "smartphone" | "tablet" | "laptop" | "desktop" | "wearable" | "device";

export type Confidence = "high" | "medium" | "low";

export interface DeviceModel {
  id: string;
  label: string;
  maker: string;
  class: DeviceClass;
  aliases: string[];
}

export interface ImpactProfile {
  pcbMassG: number;
  standardCircularity: number;
  leaftronicsCircularity: number;
  standardCo2Kg: number;
  leaftronicsCo2Kg: number;
  materialCreditEur: number;
  returnDays: number;
}

export const DEVICE_CLASS_PROFILES: Record<DeviceClass, ImpactProfile> = {
  smartphone: {
    pcbMassG: 22,
    standardCircularity: 42,
    leaftronicsCircularity: 84,
    standardCo2Kg: 2.8,
    leaftronicsCo2Kg: 1.55,
    materialCreditEur: 8,
    returnDays: 14,
  },
  tablet: {
    pcbMassG: 48,
    standardCircularity: 45,
    leaftronicsCircularity: 82,
    standardCo2Kg: 4.9,
    leaftronicsCo2Kg: 2.85,
    materialCreditEur: 13,
    returnDays: 16,
  },
  laptop: {
    pcbMassG: 145,
    standardCircularity: 48,
    leaftronicsCircularity: 86,
    standardCo2Kg: 12.6,
    leaftronicsCo2Kg: 7.1,
    materialCreditEur: 32,
    returnDays: 18,
  },
  desktop: {
    pcbMassG: 420,
    standardCircularity: 52,
    leaftronicsCircularity: 88,
    standardCo2Kg: 26.5,
    leaftronicsCo2Kg: 15.7,
    materialCreditEur: 74,
    returnDays: 21,
  },
  wearable: {
    pcbMassG: 9,
    standardCircularity: 38,
    leaftronicsCircularity: 78,
    standardCo2Kg: 1.15,
    leaftronicsCo2Kg: 0.7,
    materialCreditEur: 3,
    returnDays: 12,
  },
  device: {
    pcbMassG: 86,
    standardCircularity: 46,
    leaftronicsCircularity: 84,
    standardCo2Kg: 7.2,
    leaftronicsCo2Kg: 4.2,
    materialCreditEur: 20,
    returnDays: 17,
  },
};

export const DEVICE_MODELS: DeviceModel[] = [
  { id: "iphone-16", label: "Apple iPhone 16", maker: "Apple", class: "smartphone", aliases: ["iphone 16"] },
  { id: "iphone-15", label: "Apple iPhone 15", maker: "Apple", class: "smartphone", aliases: ["iphone 15"] },
  { id: "iphone-14", label: "Apple iPhone 14", maker: "Apple", class: "smartphone", aliases: ["iphone 14"] },
  { id: "iphone", label: "Apple iPhone", maker: "Apple", class: "smartphone", aliases: ["iphone"] },
  { id: "ipad", label: "Apple iPad", maker: "Apple", class: "tablet", aliases: ["ipad"] },
  { id: "macbook-air", label: "Apple MacBook Air", maker: "Apple", class: "laptop", aliases: ["macbook air"] },
  { id: "macbook-pro", label: "Apple MacBook Pro", maker: "Apple", class: "laptop", aliases: ["macbook pro"] },
  { id: "galaxy-s25", label: "Samsung Galaxy S25", maker: "Samsung", class: "smartphone", aliases: ["galaxy s25", "sm-s931"] },
  { id: "galaxy-s24", label: "Samsung Galaxy S24", maker: "Samsung", class: "smartphone", aliases: ["galaxy s24", "sm-s921"] },
  { id: "galaxy-s23", label: "Samsung Galaxy S23", maker: "Samsung", class: "smartphone", aliases: ["galaxy s23", "sm-s911"] },
  { id: "galaxy-tab", label: "Samsung Galaxy Tab", maker: "Samsung", class: "tablet", aliases: ["galaxy tab", "sm-x"] },
  { id: "pixel-9", label: "Google Pixel 9", maker: "Google", class: "smartphone", aliases: ["pixel 9"] },
  { id: "pixel-8", label: "Google Pixel 8", maker: "Google", class: "smartphone", aliases: ["pixel 8"] },
  { id: "pixel-7", label: "Google Pixel 7", maker: "Google", class: "smartphone", aliases: ["pixel 7"] },
  { id: "surface-pro", label: "Microsoft Surface Pro", maker: "Microsoft", class: "tablet", aliases: ["surface pro"] },
  { id: "surface-laptop", label: "Microsoft Surface Laptop", maker: "Microsoft", class: "laptop", aliases: ["surface laptop"] },
  { id: "thinkpad", label: "Lenovo ThinkPad", maker: "Lenovo", class: "laptop", aliases: ["thinkpad"] },
  { id: "dell-xps", label: "Dell XPS", maker: "Dell", class: "laptop", aliases: ["dell xps", "xps"] },
  { id: "hp-spectre", label: "HP Spectre", maker: "HP", class: "laptop", aliases: ["hp spectre", "spectre"] },
  { id: "windows-pc", label: "Windows PC", maker: "Microsoft", class: "desktop", aliases: ["windows", "pc"] },
  { id: "android-phone", label: "Android Smartphone", maker: "Android", class: "smartphone", aliases: ["android", "android phone"] },
  { id: "linux-computer", label: "Linux Computer", maker: "Linux", class: "desktop", aliases: ["linux"] },
  { id: "apple-watch", label: "Apple Watch", maker: "Apple", class: "wearable", aliases: ["apple watch", "watch"] },
];

export function normalizeDeviceText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function findDeviceModel(value: string) {
  const normalized = normalizeDeviceText(value);
  if (!normalized) return undefined;

  return DEVICE_MODELS.find((model) => {
    const label = normalizeDeviceText(model.label);
    return label.includes(normalized) || normalized.includes(label) || model.aliases.some((alias) => normalized.includes(alias));
  });
}

export function classifyDevice(value: string, fallback: DeviceClass = "device"): DeviceClass {
  const normalized = normalizeDeviceText(value);

  if (/watch|wear|band/.test(normalized)) return "wearable";
  if (/ipad|tablet|tab|surface pro/.test(normalized)) return "tablet";
  if (/iphone|android|galaxy|pixel|phone|mobile|smartphone|sm s|moto|redmi|xiaomi|oneplus|huawei|honor|oppo|vivo|nokia/.test(normalized)) {
    return "smartphone";
  }
  if (/macbook|laptop|notebook|thinkpad|xps|spectre|surface laptop|chromebook/.test(normalized)) return "laptop";
  if (/windows|macintosh|linux|desktop|pc|imac|workstation/.test(normalized)) return "desktop";

  return fallback;
}

export function confidenceScore(confidence: Confidence) {
  if (confidence === "high") return 92;
  if (confidence === "medium") return 68;
  return 43;
}
