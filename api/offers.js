import { offers } from "./_offers.js";

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const {
    material = "all",
    region = "all",
    mode = "all",
    minPrice = "-100",
    availableOnly = "false",
    query = "",
    sort = "price-desc",
  } = request.query;

  const search = String(query).trim().toLowerCase();
  const minimumPrice = toNumber(minPrice, -100);

  const result = offers
    .filter((offer) => {
      if (material !== "all" && offer.material !== material) return false;
      if (region !== "all" && offer.city !== region) return false;
      if (mode !== "all" && offer.mode !== mode) return false;
      if (offer.pricePerTon < minimumPrice) return false;
      if (availableOnly === "true" && offer.availability !== "Sofort verfügbar") {
        return false;
      }
      if (!search) return true;

      return [offer.provider, offer.material, offer.city].some((value) =>
        value.toLowerCase().includes(search),
      );
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.pricePerTon - b.pricePerTon;
      if (sort === "rating") return b.rating - a.rating;
      return b.pricePerTon - a.pricePerTon;
    });

  return response.status(200).json({
    offers: result,
    total: result.length,
  });
}
