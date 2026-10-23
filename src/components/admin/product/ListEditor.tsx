"use client";

import { btnGhost, Input } from "../ui";

type Props = {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
  addLabel?: string;
};

/** Lista de textos cortos: agregar, editar, reordenar y quitar. */
export default function ListEditor({ label, hint, values, onChange, placeholder, max = 8, addLabel = "Agregar" }: Props) {
  const set = (i: number, v: string) => onChange(values.map((x, n) => (n === i ? v : x)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= values.length) return;
    const next = [...values];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-ink">{label}</p>
      {hint && <p className="mb-2 text-xs text-slate">{hint}</p>}
      <ul className="space-y-2">
        {values.map((v, i) => (
          <li key={i} className="flex items-center gap-2">
            <Input value={v} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} aria-label={`${label} ${i + 1}`} />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir" className="px-1.5 text-slate disabled:opacity-30">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === values.length - 1} aria-label="Bajar" className="px-1.5 text-slate disabled:opacity-30">↓</button>
            <button type="button" onClick={() => onChange(values.filter((_, n) => n !== i))} aria-label="Quitar" className="px-1.5 text-[#c62828]">✕</button>
          </li>
        ))}
      </ul>
      {values.length < max && (
        <button type="button" onClick={() => onChange([...values, ""])} className={`${btnGhost} mt-2`}>
          + {addLabel}
        </button>
      )}
    </div>
  );
}
