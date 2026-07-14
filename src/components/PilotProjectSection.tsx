import { lazy, Suspense, useEffect, useRef } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Factory,
  Flame,
  Handshake,
  LoaderCircle,
  Recycle,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useElementVisibility } from "@/components/useScrollProgress";
import type { Language } from "@/lib/i18n";

const PilotPCBScene = lazy(() =>
  import("@/components/InteractivePCBModelScene").then((module) => ({ default: module.PilotPCBScene })),
);

export type PilotRoleId = "oem" | "customer" | "recycler" | "smelter" | "partner";

type PilotFormCopy = {
  company: string;
  contact: string;
  email: string;
  eyebrow: string;
  notes: string;
  product: string;
  roleLabel: string;
  submit: string;
  text: string;
  title: string;
};

type PilotProjectSectionProps = {
  activeRole: PilotRoleId;
  chooseRole: (role: PilotRoleId) => void;
  confirmation: { text: string; title: string } | null;
  copy: PilotFormCopy;
  defaultProduct?: string;
  isSubmitting: boolean;
  language: Language;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  roleTitles: Record<PilotRoleId, string>;
};

type RoleVisual = {
  accent: string;
  icon: LucideIcon;
};

const roleOrder: PilotRoleId[] = ["oem", "customer", "smelter"];

const roleVisuals: Record<PilotRoleId, RoleVisual> = {
  oem: { accent: "#b8ff59", icon: Factory },
  customer: { accent: "#75d9ff", icon: UserRound },
  recycler: { accent: "#ffc857", icon: Recycle },
  smelter: { accent: "#ff7b65", icon: Flame },
  partner: { accent: "#e7efe9", icon: Handshake },
};

const privacyCopy: Record<Language, { link: string; note: string }> = {
  de: {
    link: "Datenschutzhinweise",
    note: "Prototyp-Hinweis: Deine Eingaben werden derzeit nur lokal in diesem Browser gespeichert und noch nicht an Leaftronics übertragen.",
  },
  en: {
    link: "Privacy notice",
    note: "Prototype note: Your entries are currently stored only in this browser and are not yet sent to Leaftronics.",
  },
  zh: {
    link: "隐私说明",
    note: "原型提示：当前输入内容仅保存在此浏览器中，尚不会发送给 Leaftronics。",
  },
};

const fieldClassName =
  "h-12 w-full rounded-md border border-white/14 bg-black/20 px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 hover:border-white/24 focus:border-white/45 focus:bg-black/30 focus:ring-2 focus:ring-white/10";

function MagneticSubmitButton({
  accent,
  disabled,
  label,
}: {
  accent: string;
  disabled: boolean;
  label: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const resetPosition = () => {
    if (buttonRef.current) buttonRef.current.style.transform = "translate3d(0, 0, 0)";
  };

  useEffect(() => {
    const resetOutsideButton = (event: PointerEvent) => {
      const button = buttonRef.current;
      if (!button) return;
      const bounds = button.getBoundingClientRect();
      const isOutside =
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom;
      if (isOutside) button.style.transform = "translate3d(0, 0, 0)";
    };

    const resetOnBlur = () => {
      if (buttonRef.current) buttonRef.current.style.transform = "translate3d(0, 0, 0)";
    };
    window.addEventListener("pointermove", resetOutsideButton, { passive: true });
    window.addEventListener("blur", resetOnBlur);
    return () => {
      window.removeEventListener("pointermove", resetOutsideButton);
      window.removeEventListener("blur", resetOnBlur);
    };
  }, []);

  const moveTowardsPointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch" || !buttonRef.current) return;
    const bounds = buttonRef.current.getBoundingClientRect();
    const x = Math.max(-14, Math.min(14, (event.clientX - bounds.left - bounds.width / 2) * 0.055));
    const y = Math.max(-4, Math.min(4, (event.clientY - bounds.top - bounds.height / 2) * 0.12));
    buttonRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  return (
    <button
      ref={buttonRef}
      type="submit"
      disabled={disabled}
      onPointerMove={moveTowardsPointer}
      onPointerLeave={resetPosition}
      onPointerCancel={resetPosition}
      onPointerUp={resetPosition}
      onMouseLeave={resetPosition}
      onBlur={resetPosition}
      className="group relative flex h-14 w-full items-center justify-between overflow-hidden rounded-md px-5 text-left font-semibold text-[#07100c] shadow-[0_16px_42px_rgba(0,0,0,0.28)] transition-[transform,box-shadow,filter] duration-200 hover:shadow-[0_20px_52px_rgba(0,0,0,0.4)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#07100c] disabled:cursor-wait disabled:opacity-65"
      style={{ backgroundColor: accent }}
    >
      <span
        aria-hidden="true"
        className="absolute -left-20 top-0 h-full w-12 -skew-x-12 bg-white/35 transition-transform duration-700 ease-out group-hover:translate-x-[38rem]"
      />
      <span className="relative">{disabled ? "..." : label}</span>
      <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#07100c] text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
        {disabled ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
      </span>
    </button>
  );
}

function FormField({
  label,
  name,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-white/72">
      {label}
      <input name={name} type={type} required={required} className={fieldClassName} />
    </label>
  );
}

export function PilotProjectSection({
  activeRole,
  chooseRole,
  confirmation,
  copy,
  defaultProduct = "",
  isSubmitting,
  language,
  onSubmit,
  roleTitles,
}: PilotProjectSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneVisible = useElementVisibility(sectionRef);
  const activeVisual = roleVisuals[activeRole];

  return (
    <section
      ref={sectionRef}
      id="contact-section"
      className="pilot-project-section relative isolate scroll-mt-20 overflow-hidden border-t border-white/10 bg-[#07100c] pb-10 pt-16 text-white md:pb-14 md:pt-24 lg:pb-16 lg:pt-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-colors duration-500"
        style={{ backgroundColor: activeVisual.accent, boxShadow: `0 0 52px 8px ${activeVisual.accent}55` }}
      />

      <div className="pilot-project-layout relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
        <div className="pilot-project-intro min-w-0">
          <p id="pilot-project" className="scroll-mt-4 text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: activeVisual.accent }}>
            {copy.eyebrow}
          </p>
          <h2 className="pilot-project-title mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-6xl">
            {copy.title}
          </h2>
          <p className="pilot-project-copy mt-5 max-w-xl text-base leading-7 text-white/62 md:text-lg md:leading-8">{copy.text}</p>

          <div className="pilot-project-role mt-5 inline-flex items-center gap-2.5 border-l-2 py-1 pl-3 text-sm font-medium text-white/78" style={{ borderColor: activeVisual.accent }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeVisual.accent, boxShadow: `0 0 18px ${activeVisual.accent}` }} />
            {roleTitles[activeRole]}
          </div>

          <div className="pilot-project-scene relative -mx-5 mt-2 h-[22rem] sm:-mx-8 sm:h-[28rem] lg:-ml-16 lg:mr-0 lg:h-[34rem]">
            {sceneVisible ? (
              <Suspense
                fallback={
                  <div className="grid h-full place-items-center" aria-label="3D PCB">
                    <div
                      className="h-36 w-52 animate-pulse rounded-md border border-white/15 bg-white/[0.04]"
                      style={{ boxShadow: `0 0 70px ${activeVisual.accent}1f` }}
                    />
                  </div>
                }
              >
                <PilotPCBScene />
              </Suspense>
            ) : (
              <div className="h-full w-full" aria-hidden="true" />
            )}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="relative rounded-lg border border-white/16 bg-white/[0.075] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl sm:p-7"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <p className="text-sm font-semibold text-white">{copy.roleLabel}</p>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/38">01 / 02</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5" role="group" aria-label={copy.roleLabel}>
            {roleOrder.map((role) => {
              const visual = roleVisuals[role];
              const Icon = visual.icon;
              const isActive = role === activeRole;

              return (
                <button
                  key={role}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => chooseRole(role)}
                  className={`min-h-20 rounded-md border px-2.5 py-3 text-left transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                    isActive ? "bg-white/12 text-white" : "border-white/10 bg-black/15 text-white/48 hover:border-white/22 hover:text-white/75"
                  } ${role === "partner" ? "col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1" : ""}`}
                  style={isActive ? { borderColor: visual.accent, boxShadow: `inset 0 0 24px ${visual.accent}12` } : undefined}
                >
                  <Icon className="h-4 w-4" style={isActive ? { color: visual.accent } : undefined} />
                  <span className="mt-2 block text-[11px] font-semibold leading-4">{roleTitles[role]}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <p className="text-sm font-semibold text-white">{copy.product}</p>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/38">02 / 02</span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField name="company" label={copy.company} required />
            <FormField name="contact" label={copy.contact} required />
            <FormField name="email" label={copy.email} type="email" required />
            <label className="grid gap-2 text-sm font-medium text-white/72">
              {copy.product}
              <input key={activeRole} name="product" defaultValue={defaultProduct} className={fieldClassName} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-white/72 sm:col-span-2">
              {copy.notes}
              <textarea
                name="notes"
                rows={4}
                className={`${fieldClassName} h-auto min-h-28 resize-y py-3 leading-6`}
              />
            </label>
          </div>

          {confirmation ? (
            <div className="mt-5 border-l-2 bg-black/20 px-4 py-3" style={{ borderColor: activeVisual.accent }} role="status">
              <p className="inline-flex items-center gap-2 font-semibold" style={{ color: activeVisual.accent }}>
                <CheckCircle2 className="h-4 w-4" />
                {confirmation.title}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-white/58">{confirmation.text}</p>
            </div>
          ) : null}

          <div className="mt-6">
            <MagneticSubmitButton accent={activeVisual.accent} disabled={isSubmitting} label={copy.submit} />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-white/42">
            {privacyCopy[language].note}{" "}
            <Link to="/datenschutz" className="font-semibold text-white/68 underline decoration-white/24 underline-offset-4 hover:text-white">
              {privacyCopy[language].link}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
