export type RefurbishmentStatus = "refurbished" | "refurbishable" | "not_assessed";

export type B2BDeviceRecord = {
  serial: string;
  device: string;
  deviceCategory: string;
  totalWeightKg: number;
  metalSharePercent: number;
  returnQuantity: number;
  metalsG: {
    gold: number;
    silver: number;
    palladium: number;
    gallium: number;
    tantalum: number;
    copper: number;
  };
  refurbishmentStatus: RefurbishmentStatus;
};

// Reference profiles supplied for the Leaftronics prototype. All values are per device.
const deviceTemplates = [
  { device: "Desktop-PC / Workstation", category: "IT-Arbeitsplatz", weightKg: 10, gold: 0.25, silver: 1, palladium: 0.08, gallium: 0.02, tantalum: 0.2, copper: 1000, share: 10, minQuantity: 2, maxQuantity: 18 },
  { device: "Notebook / Business-Laptop", category: "IT-Arbeitsplatz", weightKg: 2, gold: 0.12, silver: 0.5, palladium: 0.04, gallium: 0.03, tantalum: 0.15, copper: 250, share: 12.5, minQuantity: 4, maxQuantity: 36 },
  { device: "Thin Client", category: "IT-Arbeitsplatz", weightKg: 1.2, gold: 0.06, silver: 0.25, palladium: 0.02, gallium: 0.015, tantalum: 0.08, copper: 120, share: 10, minQuantity: 5, maxQuantity: 48 },
  { device: "Server / Rack-Server", category: "IT-Infrastruktur", weightKg: 25, gold: 1.2, silver: 4, palladium: 0.35, gallium: 0.08, tantalum: 0.8, copper: 3000, share: 12, minQuantity: 1, maxQuantity: 12 },
  { device: "Storage-System / NAS", category: "IT-Infrastruktur", weightKg: 12, gold: 0.45, silver: 1.5, palladium: 0.12, gallium: 0.04, tantalum: 0.35, copper: 1500, share: 12.5, minQuantity: 1, maxQuantity: 16 },
  { device: "Netzwerk-Switch / Router", category: "Netzwerkinfrastruktur", weightKg: 8, gold: 0.6, silver: 2, palladium: 0.2, gallium: 0.05, tantalum: 0.4, copper: 1200, share: 15, minQuantity: 2, maxQuantity: 24 },
  { device: "USV-Anlage", category: "Energieversorgung", weightKg: 35, gold: 0.08, silver: 0.5, palladium: 0.02, gallium: 0.01, tantalum: 0.05, copper: 5000, share: 14.3, minQuantity: 1, maxQuantity: 8 },
  { device: "LCD-/LED-Monitor", category: "IT-Arbeitsplatz", weightKg: 6, gold: 0.03, silver: 0.2, palladium: 0.01, gallium: 0.02, tantalum: 0.03, copper: 350, share: 5.8, minQuantity: 3, maxQuantity: 30 },
  { device: "Industrie-PC", category: "Industrieautomation", weightKg: 8, gold: 0.25, silver: 1, palladium: 0.08, gallium: 0.03, tantalum: 0.2, copper: 1000, share: 12.5, minQuantity: 1, maxQuantity: 16 },
  { device: "Panel-PC / HMI", category: "Industrieautomation", weightKg: 5, gold: 0.15, silver: 0.6, palladium: 0.04, gallium: 0.025, tantalum: 0.12, copper: 500, share: 10, minQuantity: 2, maxQuantity: 20 },
  { device: "CNC-Fräsmaschine", category: "Produktion", weightKg: 5000, gold: 1, silver: 5, palladium: 0.3, gallium: 0.1, tantalum: 0.5, copper: 100000, share: 2, minQuantity: 1, maxQuantity: 3 },
  { device: "CNC-Drehmaschine", category: "Produktion", weightKg: 4000, gold: 0.8, silver: 4, palladium: 0.25, gallium: 0.08, tantalum: 0.4, copper: 80000, share: 2, minQuantity: 1, maxQuantity: 3 },
  { device: "Spritzgussmaschine", category: "Produktion", weightKg: 8000, gold: 0.6, silver: 3, palladium: 0.2, gallium: 0.05, tantalum: 0.3, copper: 120000, share: 1.5, minQuantity: 1, maxQuantity: 2 },
  { device: "Industrieroboter / Roboterarm", category: "Robotik", weightKg: 1200, gold: 1.2, silver: 5, palladium: 0.4, gallium: 0.12, tantalum: 0.6, copper: 60000, share: 5, minQuantity: 1, maxQuantity: 5 },
  { device: "Förderanlage / Förderband", category: "Intralogistik", weightKg: 2000, gold: 0.1, silver: 1, palladium: 0.03, gallium: 0.01, tantalum: 0.05, copper: 40000, share: 2, minQuantity: 1, maxQuantity: 4 },
  { device: "Verpackungsmaschine", category: "Produktion", weightKg: 3000, gold: 0.7, silver: 4, palladium: 0.25, gallium: 0.08, tantalum: 0.4, copper: 70000, share: 2.3, minQuantity: 1, maxQuantity: 3 },
  { device: "Druckmaschine / industrielles Drucksystem", category: "Produktion", weightKg: 10000, gold: 1.5, silver: 8, palladium: 0.5, gallium: 0.15, tantalum: 0.8, copper: 200000, share: 2, minQuantity: 1, maxQuantity: 2 },
  { device: "Kompressor / Druckluftanlage", category: "Versorgungstechnik", weightKg: 1500, gold: 0.1, silver: 0.8, palladium: 0.03, gallium: 0.01, tantalum: 0.05, copper: 35000, share: 2.3, minQuantity: 1, maxQuantity: 4 },
  { device: "Laser-/Schneidanlage", category: "Produktion", weightKg: 8000, gold: 2, silver: 10, palladium: 0.7, gallium: 0.2, tantalum: 1, copper: 180000, share: 2.3, minQuantity: 1, maxQuantity: 2 },
  { device: "Mess-, Prüf- und Kalibriergerät", category: "Messtechnik", weightKg: 30, gold: 0.8, silver: 3, palladium: 0.25, gallium: 0.08, tantalum: 0.5, copper: 3000, share: 10, minQuantity: 1, maxQuantity: 10 },
] as const;

const refurbishmentStatuses: RefurbishmentStatus[] = ["refurbished", "refurbishable", "not_assessed", "refurbishable", "refurbished"];

const quantityFor = (index: number, minimum: number, maximum: number) => minimum + ((index * 11 + 7) % (maximum - minimum + 1));

export const B2B_DEVICE_CATALOG: B2BDeviceRecord[] = Array.from({ length: 200 }, (_, index) => {
  const template = deviceTemplates[index % deviceTemplates.length];
  const series = String(index + 1).padStart(4, "0");

  return {
    serial: `LT-B2B-26-${series}`,
    device: template.device,
    deviceCategory: template.category,
    totalWeightKg: template.weightKg,
    metalSharePercent: template.share,
    returnQuantity: quantityFor(index, template.minQuantity, template.maxQuantity),
    metalsG: {
      gold: template.gold,
      silver: template.silver,
      palladium: template.palladium,
      gallium: template.gallium,
      tantalum: template.tantalum,
      copper: template.copper,
    },
    refurbishmentStatus: refurbishmentStatuses[index % refurbishmentStatuses.length],
  };
});
