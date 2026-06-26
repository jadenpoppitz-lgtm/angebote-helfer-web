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
};

// Test data — Prototyp. Jede Seriennummer ist einer Stadt zugeordnet.
export const SERIAL_DB: Record<string, SerialLookup> = {
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
        name: "Kernbeißer Hub Mitte",
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

export const DEMO_SERIAL = "KB-DD-0001";