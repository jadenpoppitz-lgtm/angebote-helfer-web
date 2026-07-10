export type LegalOperator = {
  city: string;
  country: string;
  editorialAddress: string;
  editorialResponsible: string;
  email: string;
  legalForm: string;
  legalName: string;
  phone: string;
  postalCode: string;
  registerCourt: string;
  registerNumber: string;
  representedBy: string;
  streetAddress: string;
  vatId: string;
};

export type HostingDetails = {
  address: string;
  provider: string;
  region: string;
  serverLogRetention: string;
};

// Fill these fields with the final entity details before the public launch.
export const legalOperator: LegalOperator = {
  legalName: "",
  legalForm: "",
  representedBy: "",
  streetAddress: "",
  postalCode: "",
  city: "Dresden",
  country: "Deutschland",
  email: "",
  phone: "",
  registerCourt: "",
  registerNumber: "",
  vatId: "",
  editorialResponsible: "",
  editorialAddress: "",
};

// Production hosting is not defined in this local prototype yet.
export const hostingDetails: HostingDetails = {
  provider: "",
  address: "",
  region: "",
  serverLogRetention: "",
};

export const missingOperatorFields = [
  ["legalName", "vollständiger Name des Anbieters"],
  ["legalForm", "Rechtsform"],
  ["representedBy", "vertretungsberechtigte Person"],
  ["streetAddress", "ladungsfähige Straßenanschrift"],
  ["postalCode", "Postleitzahl"],
  ["email", "E-Mail-Adresse"],
] as const satisfies ReadonlyArray<readonly [keyof LegalOperator, string]>;

export const isOperatorComplete = missingOperatorFields.every(([field]) => legalOperator[field].trim().length > 0);
export const isHostingComplete = Boolean(
  hostingDetails.provider && hostingDetails.address && hostingDetails.region && hostingDetails.serverLogRetention,
);
