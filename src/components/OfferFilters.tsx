import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MATERIALS, REGIONS, type Material, type DeliveryMode } from "@/data/offers";
import { SlidersHorizontal } from "lucide-react";

export interface Filters {
  material: Material | "all";
  region: string | "all";
  mode: DeliveryMode | "all";
  minPrice: number;
  availableOnly: boolean;
}

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  onReset: () => void;
}

export function OfferFilters({ filters, setFilters, onReset }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg font-semibold">Filter</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Zurücksetzen
        </Button>
      </div>
      <div className="grid gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Material
          </Label>
          <Select
            value={filters.material}
            onValueChange={(v) =>
              setFilters({ ...filters, material: v as Filters["material"] })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Materialien</SelectItem>
              {MATERIALS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Region
          </Label>
          <Select
            value={filters.region}
            onValueChange={(v) => setFilters({ ...filters, region: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ganz Deutschland</SelectItem>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Übergabe
          </Label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(["all", "Abholung", "Anlieferung"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilters({ ...filters, mode: m })}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  filters.mode === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {m === "all" ? "Alle" : m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Mindestvergütung: {filters.minPrice} €/t
          </Label>
          <Slider
            className="mt-3"
            min={-100}
            max={500}
            step={5}
            value={[filters.minPrice]}
            onValueChange={(v) => setFilters({ ...filters, minPrice: v[0] })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Negative Werte = Entsorgungsgebühr akzeptabel
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) =>
              setFilters({ ...filters, availableOnly: e.target.checked })
            }
            className="h-4 w-4 accent-primary"
          />
          Nur sofort verfügbare Angebote
        </label>
      </div>
    </div>
  );
}