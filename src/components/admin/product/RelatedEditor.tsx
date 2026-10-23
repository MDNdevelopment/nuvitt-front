"use client";

import { btnGhost, Input, Select } from "../ui";

export type RelatedDraft = { slug: string; es: string; en: string };

/** Hasta 3 productos relacionados con su descripción corta en cada idioma. */
export default function RelatedEditor({
  items,
  options,
  onChange,
}: {
  items: RelatedDraft[];
  options: { slug: string; name: string }[];
  onChange: (next: RelatedDraft[]) => void;
}) {
  const patch = (i: number, p: Partial<RelatedDraft>) => onChange(items.map((r, n) => (n === i ? { ...r, ...p } : r)));
  return (
    <div className="space-y-3">
      {items.map((r, i) => (
        <div key={i} className="grid gap-3 rounded-lg border border-[#e1e8ee] p-3 sm:grid-cols-[200px_1fr_1fr_auto]">
          <Select value={r.slug} onChange={(e) => patch(i, { slug: e.target.value })} aria-label={`Producto relacionado ${i + 1}`}>
            <option value="">Elige un producto…</option>
            {options.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </Select>
          <Input value={r.es} onChange={(e) => patch(i, { es: e.target.value })} placeholder="Descripción corta (español)" aria-label={`Descripción ES ${i + 1}`} />
          <Input value={r.en} onChange={(e) => patch(i, { en: e.target.value })} placeholder="Short description (English)" aria-label={`Descripción EN ${i + 1}`} />
          <button type="button" onClick={() => onChange(items.filter((_, n) => n !== i))} aria-label="Quitar relacionado" className="px-2 text-[#c62828]">✕</button>
        </div>
      ))}
      {items.length < 3 && (
        <button type="button" onClick={() => onChange([...items, { slug: "", es: "", en: "" }])} className={btnGhost}>
          + Agregar producto relacionado
        </button>
      )}
    </div>
  );
}
