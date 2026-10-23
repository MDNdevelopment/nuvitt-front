"use client";

import type { ContentLocale, NutritionRow } from "@/lib/admin/content";
import ListEditor from "./ListEditor";
import { btnGhost, Checkbox, Field, Input, Textarea } from "../ui";

type Nutrition = ContentLocale["nutrition"];

/** Editor de la tabla nutricional de un idioma. */
export default function NutritionEditor({ lang, value, onChange }: { lang: "es" | "en"; value: Nutrition; onChange: (n: Nutrition) => void }) {
  const set = <K extends keyof Nutrition>(k: K, v: Nutrition[K]) => onChange({ ...value, [k]: v });
  const row = (i: number, p: Partial<NutritionRow>) => set("rows", value.rows.map((r, n) => (n === i ? { ...r, ...p } : r)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.rows.length) return;
    const next = [...value.rows];
    [next[i], next[j]] = [next[j], next[i]];
    set("rows", next);
  };
  const es = lang === "es";
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={es ? "Título de la tabla" : "Table title"} htmlFor={`nut-title-${lang}`}>
          <Input id={`nut-title-${lang}`} value={value.title} onChange={(e) => set("title", e.target.value)} placeholder={es ? "Tabla nutricional" : "Supplement facts"} />
        </Field>
        <Field label={es ? "Subtítulo" : "Subtitle"} htmlFor={`nut-sub-${lang}`}>
          <Input id={`nut-sub-${lang}`} value={value.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <Field label={es ? "Encabezado de % valor diario" : "Daily value header"} htmlFor={`nut-dv-${lang}`}>
          <Input id={`nut-dv-${lang}`} value={value.dvHeader} onChange={(e) => set("dvHeader", e.target.value)} placeholder="%VD" />
        </Field>
      </div>
      <ListEditor label={es ? "Porción" : "Serving"} hint={es ? "Ej.: Porción: 1 cápsula · Porciones por envase: 30" : "E.g.: Serving size: 1 capsule"} values={value.serving} onChange={(v) => set("serving", v)} max={6} addLabel={es ? "Agregar línea" : "Add line"} />

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">{es ? "Filas" : "Rows"}</p>
        <div className="space-y-3">
          {value.rows.map((r, i) => (
            <div key={i} className="rounded-lg border border-[#e1e8ee] p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_130px_100px]">
                <Textarea
                  rows={2}
                  value={r.name.join("\n")}
                  onChange={(e) => row(i, { name: e.target.value.split("\n") })}
                  placeholder={es ? "Nombre (una línea por renglón)" : "Name (one line per row)"}
                  aria-label={`${es ? "Nombre" : "Name"} ${i + 1}`}
                />
                <Input value={r.amount} onChange={(e) => row(i, { amount: e.target.value })} placeholder={es ? "Cantidad" : "Amount"} aria-label={`${es ? "Cantidad" : "Amount"} ${i + 1}`} />
                <Input value={r.dv} onChange={(e) => row(i, { dv: e.target.value })} placeholder="%VD" aria-label={`%VD ${i + 1}`} />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <Checkbox label={es ? "Fila de nota/subtítulo" : "Note row"} checked={!!r.note} onChange={(e) => row(i, { note: e.target.checked })} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir fila" className="px-1.5 text-slate disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === value.rows.length - 1} aria-label="Bajar fila" className="px-1.5 text-slate disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => set("rows", value.rows.filter((_, n) => n !== i))} aria-label="Quitar fila" className="px-1.5 text-[#c62828]">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {value.rows.length < 60 && (
          <button type="button" onClick={() => set("rows", [...value.rows, { name: [""], amount: "", dv: "" }])} className={`${btnGhost} mt-2`}>
            + {es ? "Agregar fila" : "Add row"}
          </button>
        )}
      </div>

      <Field label={es ? "Nota al pie" : "Footnote"} htmlFor={`nut-foot-${lang}`}>
        <Textarea id={`nut-foot-${lang}`} value={value.footnote} onChange={(e) => set("footnote", e.target.value)} />
      </Field>
      <Field label={es ? "Otros ingredientes" : "Other ingredients"} htmlFor={`nut-others-${lang}`}>
        <Textarea id={`nut-others-${lang}`} value={value.others} onChange={(e) => set("others", e.target.value)} />
      </Field>
    </div>
  );
}
