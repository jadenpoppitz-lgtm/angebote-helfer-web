import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Offer } from "@/data/offers";
import { MapPin, Star, Truck, PackageCheck, Clock } from "lucide-react";

interface Props {
  offer: Offer;
  onRequest: (offer: Offer) => void;
}

const MATERIAL_COLOR: Record<string, string> = {
  Elektroschrott: "bg-[hsl(210_80%_94%)] text-[hsl(210_60%_30%)]",
  Metall: "bg-[hsl(28_80%_92%)] text-[hsl(28_60%_30%)]",
  Papier: "bg-[hsl(38_80%_92%)] text-[hsl(28_60%_30%)]",
  Kunststoff: "bg-[hsl(190_70%_92%)] text-[hsl(190_60%_28%)]",
  Glas: "bg-[hsl(160_50%_92%)] text-[hsl(160_50%_28%)]",
  Holz: "bg-[hsl(24_50%_92%)] text-[hsl(24_45%_30%)]",
  Batterien: "bg-[hsl(340_60%_94%)] text-[hsl(340_55%_35%)]",
};

export function OfferCard({ offer, onRequest }: Props) {
  const price = offer.pricePerTon;
  const isPay = price > 0;
  const isFree = price === 0;
  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant md:flex-row md:items-center">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={`${MATERIAL_COLOR[offer.material]} border-0 font-medium`}
          >
            {offer.material}
          </Badge>
          <Badge variant="outline" className="gap-1">
            {offer.mode === "Abholung" ? (
              <Truck className="h-3 w-3" />
            ) : (
              <PackageCheck className="h-3 w-3" />
            )}
            {offer.mode}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {offer.availability}
          </Badge>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold leading-tight">
            {offer.provider}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {offer.city} · PLZ {offer.plzPrefix}xxx
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {offer.rating.toFixed(1)}{" "}
              <span className="text-xs">({offer.reviews})</span>
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{offer.conditions}</p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-3 border-t border-border pt-4 md:items-end md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <div className="md:text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {isPay ? "Vergütung" : isFree ? "Konditionen" : "Entsorgungsgebühr"}
          </p>
          <p
            className={`font-display text-2xl font-semibold ${
              isPay
                ? "text-success"
                : isFree
                  ? "text-foreground"
                  : "text-destructive"
            }`}
          >
            {isFree
              ? "Kostenfrei"
              : `${Math.abs(price).toLocaleString("de-DE")} ${offer.unit}`}
          </p>
        </div>
        <Button onClick={() => onRequest(offer)} className="w-full md:w-auto">
          Anfrage senden
        </Button>
      </div>
    </article>
  );
}