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
import { createRequest } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";
import { CheckCircle2, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  offer?: Offer | null;
}

export function RequestDialog({ open, onOpenChange, offer }: Props) {
  const { t, materialLabel, modeLabel } = useLanguage();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createRequest({
        offerId: offer?.id,
        material,
        quantity,
        plz,
        city,
        pickup,
        name,
        email,
        phone,
        notes,
      });

      toast.success(t.requestSent, {
        description: t.referenceMessage(result.request.id, name),
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(t.requestFailed, {
        description: error instanceof Error ? error.message : t.retry,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {offer ? `${t.sendRequest}: ${offer.provider}` : t.requestOffer}
          </DialogTitle>
          <DialogDescription>{t.dialogStep(step)}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex gap-1.5">
          {[1, 2].map((item) => (
            <div
              key={item}
              className={`h-1.5 flex-1 rounded-full ${
                item <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="grid gap-4 py-2">
            <div>
              <Label>{t.navMaterials}</Label>
              <Select value={material} onValueChange={(value) => setMaterial(value as Material)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIALS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {materialLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.quantity}</Label>
                <Input
                  className="mt-1"
                  placeholder={t.quantityPlaceholder}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>
              <div>
                <Label>{t.zip}</Label>
                <Input
                  className="mt-1"
                  placeholder="10115"
                  value={plz}
                  maxLength={5}
                  onChange={(event) => setPlz(event.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
            <div>
              <Label>{t.cityOptional}</Label>
              <Input
                className="mt-1"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t.cityPlaceholder}
              />
            </div>
            <div>
              <Label>{t.handover}</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {(["Abholung", "Anlieferung"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPickup(mode)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      pickup === mode
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {modeLabel(mode)}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground hover:bg-muted/50">
              <Upload className="h-4 w-4" />
              {t.photos}
              <input type="file" multiple className="hidden" accept="image/*" />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 py-2">
            <div>
              <Label>{t.name}</Label>
              <Input
                className="mt-1"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t.namePlaceholder}
              />
            </div>
            <div>
              <Label>{t.email}</Label>
              <Input
                className="mt-1"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div>
              <Label>{t.phoneOptional}</Label>
              <Input
                className="mt-1"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+49 ..."
              />
            </div>
            <div>
              <Label>{t.notes}</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t.notesPlaceholder}
              />
            </div>
            <p className="flex items-start gap-2 rounded-md bg-success/10 p-3 text-xs text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {t.privacyNote}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              {t.back}
            </Button>
          )}
          {step === 1 ? (
            <Button disabled={!canNext1} onClick={() => setStep(2)}>
              {t.next}
            </Button>
          ) : (
            <Button disabled={!canSubmit || isSubmitting} onClick={submit}>
              {isSubmitting ? t.sending : t.sendRequest}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
