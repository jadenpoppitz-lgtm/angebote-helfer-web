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
import { MATERIALS, REGIONS, type DeliveryMode, type Material } from "@/data/offers";
import { useLanguage } from "@/lib/i18n";
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
  const { t, materialLabel, modeLabel, cityLabel } = useLanguage();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg font-semibold">{t.filters}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          {t.reset}
        </Button>
      </div>
      <div className="grid gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            {t.navMaterials}
          </Label>
          <Select
            value={filters.material}
            onValueChange={(value) =>
              setFilters({ ...filters, material: value as Filters["material"] })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allMaterials}</SelectItem>
              {MATERIALS.map((material) => (
                <SelectItem key={material} value={material}>
                  {materialLabel(material)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            {t.region}
          </Label>
          <Select
            value={filters.region}
            onValueChange={(value) => setFilters({ ...filters, region: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allGermany}</SelectItem>
              {REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {cityLabel(region)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            {t.handover}
          </Label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(["all", "Abholung", "Anlieferung"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilters({ ...filters, mode })}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  filters.mode === mode
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {mode === "all" ? t.all : modeLabel(mode)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            {t.minCompensation(filters.minPrice)}
          </Label>
          <Slider
            className="mt-3"
            min={-100}
            max={500}
            step={5}
            value={[filters.minPrice]}
            onValueChange={(value) => setFilters({ ...filters, minPrice: value[0] })}
          />
          <p className="mt-1 text-xs text-muted-foreground">{t.negativeHint}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(event) =>
              setFilters({ ...filters, availableOnly: event.target.checked })
            }
            className="h-4 w-4 accent-primary"
          />
          {t.availableOnly}
        </label>
      </div>
    </div>
  );
}
