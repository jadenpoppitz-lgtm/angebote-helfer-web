import { OFFERS, type DeliveryMode, type Material, type Offer } from "@/data/offers";
import type { Filters } from "@/components/OfferFilters";

export type OfferSort = "price-desc" | "price-asc" | "rating";

export interface RequestPayload {
  offerId?: string;
  material: Material;
  quantity: string;
  plz: string;
  city?: string;
  pickup: DeliveryMode;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

interface OffersResponse {
  offers: Offer[];
  total: number;
}

interface RequestResponse {
  request: {
    id: string;
    createdAt: string;
    status: string;
  };
  message: string;
}

export async function fetchOffers(
  filters: Filters,
  query: string,
  sort: OfferSort,
): Promise<OffersResponse> {
  const params = new URLSearchParams({
    material: filters.material,
    region: filters.region,
    mode: filters.mode,
    minPrice: String(filters.minPrice),
    availableOnly: String(filters.availableOnly),
    query,
    sort,
  });

  try {
    const response = await fetch(`/api/offers?${params.toString()}`);
    if (!response.ok) throw new Error("Offers request failed");
    const data = (await response.json()) as OffersResponse;
    return data;
  } catch {
    const q = query.trim().toLowerCase();
    const offers = OFFERS.filter((offer) => {
      if (filters.material !== "all" && offer.material !== filters.material) return false;
      if (filters.region !== "all" && offer.city !== filters.region) return false;
      if (filters.mode !== "all" && offer.mode !== filters.mode) return false;
      if (offer.pricePerTon < filters.minPrice) return false;
      if (filters.availableOnly && offer.availability !== "Sofort verfügbar") return false;
      if (!q) return true;
      return [offer.provider, offer.material, offer.city].some((value) =>
        value.toLowerCase().includes(q),
      );
    }).sort((a, b) => {
      if (sort === "price-asc") return a.pricePerTon - b.pricePerTon;
      if (sort === "rating") return b.rating - a.rating;
      return b.pricePerTon - a.pricePerTon;
    });

    return { offers, total: offers.length };
  }
}

export async function createRequest(payload: RequestPayload): Promise<RequestResponse> {
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? "Anfrage konnte nicht gesendet werden.");
  }

  return data as RequestResponse;
}
