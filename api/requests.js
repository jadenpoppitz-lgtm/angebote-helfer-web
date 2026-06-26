import { materials, offers } from "./_offers.js";

const deliveryModes = ["Abholung", "Anlieferung"];

function readBody(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  return request.body;
}

function clean(value) {
  return String(value ?? "").trim();
}

function validate(payload) {
  const errors = {};
  const material = clean(payload.material);
  const pickup = clean(payload.pickup);
  const email = clean(payload.email);
  const plz = clean(payload.plz);

  if (!materials.includes(material)) errors.material = "Material ist ungueltig.";
  if (!clean(payload.quantity)) errors.quantity = "Menge ist erforderlich.";
  if (!/^\d{4,5}$/.test(plz)) errors.plz = "PLZ muss 4 bis 5 Ziffern haben.";
  if (!deliveryModes.includes(pickup)) errors.pickup = "Uebergabe ist ungueltig.";
  if (!clean(payload.name)) errors.name = "Name ist erforderlich.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "E-Mail ist ungueltig.";
  }

  return errors;
}

async function sendWebhook(inquiry) {
  const webhookUrl = process.env.REQUEST_WEBHOOK_URL;
  if (!webhookUrl) return;

  const result = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiry),
  });

  if (!result.ok) {
    throw new Error(`Webhook failed with ${result.status}`);
  }
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const payload = readBody(request);
  const errors = validate(payload);

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      error: "Bitte pruefen Sie die Eingaben.",
      fields: errors,
    });
  }

  const offer = offers.find((item) => item.id === clean(payload.offerId));
  const inquiry = {
    id: `REQ-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "new",
    offer: offer
      ? {
          id: offer.id,
          provider: offer.provider,
          city: offer.city,
        }
      : null,
    material: clean(payload.material),
    quantity: clean(payload.quantity),
    plz: clean(payload.plz),
    city: clean(payload.city),
    pickup: clean(payload.pickup),
    name: clean(payload.name),
    email: clean(payload.email).toLowerCase(),
    phone: clean(payload.phone),
    notes: clean(payload.notes),
  };

  try {
    await sendWebhook(inquiry);
  } catch (error) {
    console.error(error);
    return response.status(502).json({
      error: "Die Anfrage konnte gerade nicht weitergeleitet werden.",
    });
  }

  console.info("New recycling inquiry", inquiry);

  return response.status(201).json({
    request: inquiry,
    message: "Anfrage wurde erfolgreich aufgenommen.",
  });
}
