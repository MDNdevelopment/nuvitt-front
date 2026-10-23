"use client";

import { useRef } from "react";
import { benefitIcons, getBenefitIcon } from "@/data/benefit-icons";
import { btnGhost, fieldClass, Input, Textarea } from "../ui";

export type BenefitDraft = { icon: string; es: { title: string; text: string }; en: { title: string; text: string } };

function Svg({ id, className }: { id: string; className?: string }) {
  const icon = getBenefitIcon(id);
  if (!icon) return <span className={`${className} grid place-items-center text-xs text-slate`}>—</span>;
  return (
    <svg viewBox={icon.viewBox} className={className} fill="currentColor" aria-hidden="true">
      {icon.d.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pick = (id: string) => {
    onChange(id);
    if (ref.current) ref.current.open = false;
  };
  return (
    <details ref={ref} className="relative">
      <summary className={`${btnGhost} list-none cursor-pointer gap-2`}>
        <Svg id={value} className="size-5 text-link-blue" />
        Ícono
      </summary>
      <div className="absolute left-0 z-20 mt-2 w-[290px] rounded-lg border border-[#e1e8ee] bg-white p-3 shadow-lg">
        <div className="grid grid-cols-6 gap-1.5">
          {benefitIcons.map((ic) => (
            <button
              key={ic.id}
              type="button"
              onClick={() => pick(ic.id)}
              aria-label={`Ícono ${ic.id}`}
              className={`grid size-10 place-items-center rounded border ${value === ic.id ? "border-primary-dark bg-product-bg" : "border-transparent hover:bg-[#f1f4f7]"}`}
            >
              <Svg id={ic.id} className="size-5 text-heading-dark" />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => pick("")} className="mt-2 text-xs font-semibold text-slate hover:underline">
          Sin ícono
        </button>
      </div>
    </details>
  );
}

/** Beneficios con textos ES/EN emparejados y un ícono por beneficio. */
export default function BenefitsEditor({ items, onChange, max = 8 }: { items: BenefitDraft[]; onChange: (next: BenefitDraft[]) => void; max?: number }) {
  const patch = (i: number, p: Partial<BenefitDraft>) => onChange(items.map((b, n) => (n === i ? { ...b, ...p } : b)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-4">
      {items.map((b, i) => (
        <div key={i} className="rounded-lg border border-[#e1e8ee] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-heading-dark">Beneficio {i + 1}</p>
            <div className="flex items-center gap-2">
              <IconPicker value={b.icon} onChange={(icon) => patch(i, { icon })} />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir beneficio" className="px-1.5 text-slate disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Bajar beneficio" className="px-1.5 text-slate disabled:opacity-30">↓</button>
              <button type="button" onClick={() => onChange(items.filter((_, n) => n !== i))} aria-label="Quitar beneficio" className="px-1.5 text-[#c62828]">✕</button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Input value={b.es.title} onChange={(e) => patch(i, { es: { ...b.es, title: e.target.value } })} placeholder="Título (español)" aria-label={`Título ES ${i + 1}`} />
              <Textarea value={b.es.text} onChange={(e) => patch(i, { es: { ...b.es, text: e.target.value } })} placeholder="Descripción (español)" aria-label={`Texto ES ${i + 1}`} className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Input value={b.en.title} onChange={(e) => patch(i, { en: { ...b.en, title: e.target.value } })} placeholder="Title (English)" aria-label={`Título EN ${i + 1}`} />
              <Textarea value={b.en.text} onChange={(e) => patch(i, { en: { ...b.en, text: e.target.value } })} placeholder="Description (English)" aria-label={`Texto EN ${i + 1}`} className={fieldClass} />
            </div>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, { icon: "", es: { title: "", text: "" }, en: { title: "", text: "" } }])} className={btnGhost}>
          + Agregar beneficio
        </button>
      )}
    </div>
  );
}
