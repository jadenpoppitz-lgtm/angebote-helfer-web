export type Partner = {
  id: string;
  name: string;
  street: string;
  hours: string;
  distanceKm: number;
  type: "Sammelstelle" | "Fachhändler" | "Servicepartner";
};

export type SerialLookup = {
  serial: string;
  device: string;
  city: string;
  postalCode: string;
  partners: Partner[];
  catalogEntry?: B2BDeviceRecord;
};

// Test data — Prototyp. Jede Seriennummer ist einer Stadt zugeordnet.
const BASE_SERIAL_DB: Record<string, SerialLookup> = {
  "KB-DD-0001": {
    serial: "KB-DD-0001",
    device: "Steuerungsmodul · Leiterplatte Rev. C",
    city: "Dresden",
    postalCode: "01067",
    partners: [
      {
        id: "p1",
        name: "ElektroLoop Dresden Mitte",
        street: "Wilsdruffer Str. 24, 01067 Dresden",
        hours: "Mo–Fr 09:00–18:00",
        distanceKm: 1.2,
        type: "Sammelstelle",
      },
      {
        id: "p2",
        name: "PCB Service Neustadt",
        street: "Bautzner Str. 88, 01099 Dresden",
        hours: "Mo–Sa 10:00–19:00",
        distanceKm: 2.7,
        type: "Servicepartner",
      },
      {
        id: "p3",
        name: "Wertstoffhof Striesen",
        street: "Schandauer Str. 4, 01277 Dresden",
        hours: "Di–Sa 08:00–16:00",
        distanceKm: 4.5,
        type: "Sammelstelle",
      },
    ],
  },
  "KB-LE-0002": {
    serial: "KB-LE-0002",
    device: "Leiterplatte · Sensorboard",
    city: "Leipzig",
    postalCode: "04109",
    partners: [
      {
        id: "p1",
        name: "Kreislauf Leipzig Zentrum",
        street: "Grimmaische Str. 12, 04109 Leipzig",
        hours: "Mo–Fr 09:00–18:00",
        distanceKm: 0.8,
        type: "Sammelstelle",
      },
      {
        id: "p2",
        name: "TechReturn Plagwitz",
        street: "Karl-Heine-Str. 50, 04229 Leipzig",
        hours: "Mo–Sa 10:00–20:00",
        distanceKm: 3.4,
        type: "Fachhändler",
      },
    ],
  },
  "KB-BE-0003": {
    serial: "KB-BE-0003",
    device: "Hauptplatine · Industriesteuerung",
    city: "Berlin",
    postalCode: "10117",
    partners: [
      {
        id: "p1",
        name: "Leaftronics Hub Mitte",
        street: "Friedrichstr. 110, 10117 Berlin",
        hours: "Mo–Fr 08:00–20:00",
        distanceKm: 0.6,
        type: "Servicepartner",
      },
      {
        id: "p2",
        name: "PCB Sammelpunkt Kreuzberg",
        street: "Oranienstr. 45, 10969 Berlin",
        hours: "Mo–Sa 10:00–19:00",
        distanceKm: 2.1,
        type: "Sammelstelle",
      },
      {
        id: "p3",
        name: "ElektroLoop Prenzlauer Berg",
        street: "Schönhauser Allee 120, 10437 Berlin",
        hours: "Mo–Fr 09:00–18:00",
        distanceKm: 3.9,
        type: "Sammelstelle",
      },
    ],
  },
};

const b2bLocations = [
  { city: "Dresden", postalCode: "01067" },
  { city: "Leipzig", postalCode: "04109" },
  { city: "Berlin", postalCode: "10117" },
  { city: "Hamburg", postalCode: "20095" },
  { city: "München", postalCode: "80331" },
];

const b2bPartners = (city: string, postalCode: string): Partner[] => [
  {
    id: `b2b-hub-${city}`,
    name: `Leaftronics B2B Hub ${city}`,
    street: `B2B Rueckgabezentrum, ${postalCode} ${city}`,
    hours: "Mo-Fr 08:00-17:00",
    distanceKm: 1.1,
    type: "Servicepartner",
  },
  {
    id: `b2b-service-${city}`,
    name: `Leaftronics Servicepartner ${city}`,
    street: `Industriepark, ${postalCode} ${city}`,
    hours: "Mo-Fr 09:00-18:00",
    distanceKm: 3.2,
    type: "Servicepartner",
  },
  {
    id: `b2b-collection-${city}`,
    name: `Leaftronics Sammelstelle ${city}`,
    street: `Logistikzentrum, ${postalCode} ${city}`,
    hours: "Mo-Sa 09:00-16:00",
    distanceKm: 5.6,
    type: "Sammelstelle",
  },
];

export const SERIAL_DB: Record<string, SerialLookup> = {
  ...BASE_SERIAL_DB,
  ...Object.fromEntries(
    B2B_DEVICE_CATALOG.map((catalogEntry, index) => {
      const location = b2bLocations[index % b2bLocations.length];

      return [
        catalogEntry.serial,
        {
          serial: catalogEntry.serial,
          device: catalogEntry.device,
          city: location.city,
          postalCode: location.postalCode,
          partners: b2bPartners(location.city, location.postalCode),
          catalogEntry,
        },
      ];
    }),
  ),
};

export const DEMO_SERIAL = "LT-B2B-26-0001";
import { B2B_DEVICE_CATALOG, type B2BDeviceRecord } from "@/data/b2bDeviceCatalog";
