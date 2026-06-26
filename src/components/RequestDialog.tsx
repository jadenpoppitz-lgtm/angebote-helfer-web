import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MATERIALS, type Material, type Offer } from "@/data/offers";
import { toast } from "sonner";
import { CheckCircle2, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  offer?: Offer | null;
}

export function RequestDialog({ open, onOpenChange, offer }: Props) {
  const [step, setStep] = useState(1);
  const [material, setMaterial] = useState<Material>("Metall");
  const [quantity, setQuantity] = useState("");
  const [plz, setPlz] = useState("");
  const [city, setCity] = useState("");
  const [pickup, setPickup] = useState<"Abholung" | "Anlieferung">("Abholung");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setStep(1);
      if (offer) {
        setMaterial(offer.material);
        setPickup(offer.mode);
      }
    }
  }, [open, offer]);

  const canNext1 = quantity && plz.length >= 4;
  const canSubmit = name && /.+@.+\..+/.test(email);

  const submit = () => {
    toast.success("Anfrage gesendet", {
      description: `Wir melden uns innerhalb von 24 Stunden bei ${name}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {offer ? `Anfrage an ${offer.provider}` : "Angebot anfragen"}
          </DialogTitle>
          <DialogDescription>
            Schritt {step} von 2 · Unverbindlich und kostenfrei
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex gap-1.5">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="grid gap-4 py-2">
            <div>
              <Label>Material</Label>
              <Select
                value={material}
                onValueChange={(v) => setMaterial(v as Material)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIALS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Menge (geschätzt)</Label>
                <Input
                  className="mt-1"
                  placeholder="z. B. 500 kg"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label>PLZ</Label>
                <Input
                  className="mt-1"
                  placeholder="z. B. 10115"
                  value={plz}
                  maxLength={5}
                  onChange={(e) =>
                    setPlz(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Ort (optional)</Label>
              <Input
                className="mt-1"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Stadt"
              />
            </div>
            <div>
              <Label>Übergabe</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {(["Abholung", "Anlieferung"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPickup(m)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      pickup === m
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground hover:bg-muted/50">
              <Upload className="h-4 w-4" />
              Fotos hinzufügen (optional)
              <input type="file" multiple className="hidden" accept="image/*" />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 py-2">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vor- und Nachname"
              />
            </div>
            <div>
              <Label>E-Mail</Label>
              <Input
                className="mt-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
              />
            </div>
            <div>
              <Label>Telefon (optional)</Label>
              <Input
                className="mt-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 ..."
              />
            </div>
            <div>
              <Label>Notizen</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Besonderheiten, gewünschte Termine ..."
              />
            </div>
            <p className="flex items-start gap-2 rounded-md bg-success/10 p-3 text-xs text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Ihre Daten werden ausschließlich zur Bearbeitung der Anfrage
              verwendet.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Zurück
            </Button>
          )}
          {step === 1 ? (
            <Button disabled={!canNext1} onClick={() => setStep(2)}>
              Weiter
            </Button>
          ) : (
            <Button disabled={!canSubmit} onClick={submit}>
              Anfrage senden
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}