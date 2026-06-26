import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Materials } from "@/components/Materials";
import { OfferCard } from "@/components/OfferCard";
import { OfferFilters, type Filters } from "@/components/OfferFilters";
import { Process } from "@/components/Process";
import { Footer } from "@/components/Footer";
import { RequestDialog } from "@/components/RequestDialog";
import { OFFERS, type Material, type Offer } from "@/data/offers";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const DEFAULT_FILTERS: Filters = {
  material: "all",
  region: "all",
  mode: "all",
  minPrice: -100,
  availableOnly: false,
};

const Index = () => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"price-desc" | "price-asc" | "rating">(
    "price-desc",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);

  const offers = useMemo(() => {
    const filtered = OFFERS.filter((o) => {
      if (filters.material !== "all" && o.material !== filters.material)
        return false;
      if (filters.region !== "all" && o.city !== filters.region) return false;
      if (filters.mode !== "all" && o.mode !== filters.mode) return false;
      if (o.pricePerTon < filters.minPrice) return false;
      if (filters.availableOnly && o.availability !== "Sofort verfügbar")
        return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !o.provider.toLowerCase().includes(q) &&
          !o.material.toLowerCase().includes(q) &&
          !o.city.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "price-desc") return b.pricePerTon - a.pricePerTon;
      if (sort === "price-asc") return a.pricePerTon - b.pricePerTon;
      return b.rating - a.rating;
    });
  }, [filters, query, sort]);

  const openRequest = (offer?: Offer) => {
    setActiveOffer(offer ?? null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onRequest={() => openRequest()} />
      <main>
        <Hero onRequest={() => openRequest()} />

        <section id="angebote" className="container py-16">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Angebote
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                Aktuelle Recycling-Angebote
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {offers.length} Anbieter passen zu Ihren Kriterien
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Anbieter, Material, Stadt …"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-desc">Höchste Vergütung</SelectItem>
                  <SelectItem value="price-asc">Niedrigster Preis</SelectItem>
                  <SelectItem value="rating">Beste Bewertung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <OfferFilters
                filters={filters}
                setFilters={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
              />
            </aside>
            <div className="flex flex-col gap-4">
              {offers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                  <p className="font-display text-lg font-semibold">
                    Keine Angebote gefunden
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Passen Sie die Filter an oder fragen Sie direkt ein Angebot
                    an.
                  </p>
                </div>
              )}
              {offers.map((o) => (
                <OfferCard key={o.id} offer={o} onRequest={openRequest} />
              ))}
            </div>
          </div>
        </section>

        <Materials
          onSelect={(m) =>
            setFilters({ ...filters, material: m as Material })
          }
        />
        <Process />

        <section className="container pb-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elegant md:p-14">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="font-display text-3xl font-semibold md:text-4xl">
                  Bereit, Ihre Wertstoffe zu verwerten?
                </h2>
                <p className="mt-3 max-w-xl opacity-90">
                  Senden Sie eine unverbindliche Anfrage – wir vermitteln das
                  passende Angebot in Ihrer Region.
                </p>
              </div>
              <button
                onClick={() => openRequest()}
                className="inline-flex h-12 items-center justify-center rounded-md bg-background px-6 font-medium text-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
              >
                Angebot anfragen
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <RequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        offer={activeOffer}
      />
    </div>
  );
};

export default Index;
