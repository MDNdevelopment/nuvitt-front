"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { saveProductAction } from "@/lib/admin/actions/products";
import {
  DEFAULT_THEME,
  MEDIA_SLOTS,
  missingForActivation,
  normalizeContent,
  withDefaults,
  type ContentLocale,
  type MediaSlot,
  type Theme,
} from "@/lib/admin/content";
import type { FormState, Product } from "@/lib/admin/types";
import BenefitsEditor, { type BenefitDraft } from "./product/BenefitsEditor";
import ImageSlot from "./product/ImageSlot";
import ListEditor from "./product/ListEditor";
import NutritionEditor from "./product/NutritionEditor";
import RelatedEditor, { type RelatedDraft } from "./product/RelatedEditor";
import { btnGhost, btnPrimary, Card, Checkbox, Field, Flash, Input, Textarea } from "./ui";

const CATEGORIES: [string, string][] = [
  ["balance-renal", "Balance renal"],
  ["cardiovascular-vitalidad", "Cardiovascular y vitalidad"],
  ["inmune", "Sistema inmune"],
  ["longevidad-piel", "Longevidad y piel"],
  ["movilidad", "Movilidad"],
  ["sueno", "Sueño"],
];

const SLOT_INFO: Record<MediaSlot, { label: string; hint: string; required?: boolean; removable?: boolean }> = {
  bottle: { label: "Frasco (catálogo y destacados)", hint: "Fondo transparente, vertical.", required: true },
  hero: { label: "Imagen principal de la ficha", hint: "Primera imagen de la galería.", required: true },
  label_es: { label: "Etiqueta (español)", hint: "Opcional. Segunda imagen de la galería.", removable: true },
  label_en: { label: "Etiqueta (inglés)", hint: "Opcional. Segunda imagen de la galería.", removable: true },
};

type Lang = "es" | "en";
const LANG_NAME: Record<Lang, string> = { es: "Español", en: "English" };

function LangTabs({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div role="tablist" aria-label="Idioma" className="inline-flex rounded-lg bg-[#eef1f4] p-1">
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={lang === l}
          onClick={() => onChange(l)}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${lang === l ? "bg-white text-heading-dark shadow-sm" : "text-slate"}`}
        >
          {LANG_NAME[l]}
        </button>
      ))}
    </div>
  );
}

export default function ProductEditor({
  product,
  urls,
  options,
}: {
  product?: Product;
  /** URL ya resuelta de la imagen actual de cada ranura (o ausente). */
  urls: Partial<Record<MediaSlot, string>>;
  /** Otros productos, para elegir relacionados. */
  options: { slug: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProductAction.bind(null, product?.id), {});
  const [, startTransition] = useTransition();
  // Se envía sin el reinicio automático de formularios de React 19: así un guardado con error no
  // vacía los campos ni las fotos que el usuario ya eligió.

  const e = state.errors ?? {};
  const val = (key: string, fallback: string | number | undefined) => String(state.values?.[key] ?? fallback ?? "");

  // --- estado de la ficha (controlado: sobrevive a un guardado con errores) ---
  const [es, setEs] = useState<ContentLocale>(() => withDefaults(product?.content_es));
  const [en, setEn] = useState<ContentLocale>(() => withDefaults(product?.content_en));
  const [benefits, setBenefits] = useState<BenefitDraft[]>(() => {
    const ics = product?.shared?.icons ?? [];
    const n = Math.max(es.benefits.length, en.benefits.length);
    return Array.from({ length: n }, (_, i) => ({
      icon: ics[i] ?? "",
      es: es.benefits[i] ?? { title: "", text: "" },
      en: en.benefits[i] ?? { title: "", text: "" },
    }));
  });
  const [related, setRelated] = useState<RelatedDraft[]>(() => {
    const n = Math.max(es.related.length, en.related.length);
    return Array.from({ length: n }, (_, i) => ({ slug: es.related[i]?.slug ?? en.related[i]?.slug ?? "", es: es.related[i]?.desc ?? "", en: en.related[i]?.desc ?? "" }));
  });
  const [theme, setTheme] = useState<Theme>(() => ({ ...DEFAULT_THEME, ...(product?.shared?.theme ?? {}) }));
  const [lang, setLang] = useState<Lang>("es");
  const [price, setPrice] = useState(() => (product ? String(product.price_usd) : ""));
  const [has, setHas] = useState<Record<MediaSlot, boolean>>(() => Object.fromEntries(MEDIA_SLOTS.map((s) => [s, !!urls[s]])) as Record<MediaSlot, boolean>);
  const [active, setActive] = useState(() => (state.values ? state.values.active === "on" : !!product?.active));

  const contentEs = useMemo<ContentLocale>(() => ({ ...es, benefits: benefits.map((b) => b.es), related: related.map((r) => ({ slug: r.slug, desc: r.es })) }), [es, benefits, related]);
  const contentEn = useMemo<ContentLocale>(() => ({ ...en, benefits: benefits.map((b) => b.en), related: related.map((r) => ({ slug: r.slug, desc: r.en })) }), [en, benefits, related]);
  const missing = useMemo(
    () => missingForActivation({ price: parseFloat(price.replace(",", ".")), media: has, es: normalizeContent(contentEs), en: normalizeContent(contentEn) }),
    [price, has, contentEs, contentEn],
  );

  const cur = lang === "es" ? es : en;
  const setCur = (patch: Partial<ContentLocale>) => (lang === "es" ? setEs : setEn)((c) => ({ ...c, ...patch }));
  const cats = state.values ? [state.values.categories ?? []].flat() : (product?.categories ?? []);
  const L = lang === "es";

  const copyNutrition = () => {
    const from = lang === "es" ? en : es;
    if (cur.nutrition.rows.length > 0 && !window.confirm("Esto reemplaza la tabla actual. ¿Continuar?")) return;
    setCur({ nutrition: JSON.parse(JSON.stringify(from.nutrition)) });
  };

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-5 pb-28"
    >
      <input type="hidden" name="content_es" value={JSON.stringify(contentEs)} />
      <input type="hidden" name="content_en" value={JSON.stringify(contentEn)} />
      <input type="hidden" name="shared_icons" value={JSON.stringify(benefits.map((b) => b.icon))} />
      <input type="hidden" name="theme" value={JSON.stringify(theme)} />

      {/* 1. Datos básicos */}
      <Card className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-raleway text-lg font-bold text-heading-dark sm:col-span-2">Datos básicos</h2>
        <Field label="Nombre (español)" htmlFor="name_es" error={e.name_es}>
          <Input name="name_es" defaultValue={val("name_es", product?.name_es)} required error={e.name_es} />
        </Field>
        <Field label="Nombre (inglés)" htmlFor="name_en" error={e.name_en}>
          <Input name="name_en" defaultValue={val("name_en", product?.name_en)} required error={e.name_en} />
        </Field>
        <Field label="SKU" htmlFor="sku" error={e.sku}>
          <Input name="sku" defaultValue={val("sku", product?.sku)} required error={e.sku} />
        </Field>
        <Field label="Slug (URL)" htmlFor="slug" error={e.slug} hint={product ? "No se puede cambiar: es la URL del producto en el sitio." : "Si lo dejas vacío se genera con el nombre en español."}>
          <Input name="slug" defaultValue={val("slug", product?.slug)} disabled={!!product} error={e.slug} />
        </Field>
        <Field label="Precio (USD)" htmlFor="price_usd" error={e.price_usd}>
          <Input name="price_usd" inputMode="decimal" value={price} onChange={(ev) => setPrice(ev.target.value)} required error={e.price_usd} />
        </Field>
        <Field label="Stock (unidades)" htmlFor="stock" error={e.stock}>
          <Input name="stock" inputMode="numeric" defaultValue={val("stock", product?.stock ?? 0)} error={e.stock} />
        </Field>
        <Field label="Orden en el catálogo" htmlFor="sort" error={e.sort} hint="Menor número aparece primero.">
          <Input name="sort" inputMode="numeric" defaultValue={val("sort", product?.sort ?? 0)} error={e.sort} />
        </Field>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-semibold text-ink">Categorías</p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {CATEGORIES.map(([value, label]) => (
              <Checkbox key={value} name="categories" value={value} label={label} defaultChecked={cats.includes(value)} />
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Imágenes */}
      <Card>
        <h2 className="mb-1 font-raleway text-lg font-bold text-heading-dark">Imágenes</h2>
        <p className="mb-4 text-xs text-slate">JPG, PNG o WebP de hasta 5 MB. Al guardar se reemplazan las que subas.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEDIA_SLOTS.map((slot) => (
            <ImageSlot
              key={`${slot}-${state.saved ?? 0}`}
              slot={slot}
              {...SLOT_INFO[slot]}
              current={urls[slot] ?? null}
              error={e[`img_${slot}`]}
              onChange={(v) => setHas((h) => ({ ...h, [slot]: v }))}
            />
          ))}
        </div>
      </Card>

      {/* 3. Textos de la ficha */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-raleway text-lg font-bold text-heading-dark">Textos de la ficha</h2>
          <LangTabs lang={lang} onChange={setLang} />
        </div>
        <Field label={L ? "Subtítulo" : "Tagline"} htmlFor={`tagline-${lang}`}>
          <Input id={`tagline-${lang}`} value={cur.tagline} onChange={(ev) => setCur({ tagline: ev.target.value })} maxLength={160} />
        </Field>
        <Field label={L ? "Introducción" : "Introduction"} htmlFor={`intro-${lang}`}>
          <Textarea id={`intro-${lang}`} rows={5} value={cur.intro} onChange={(ev) => setCur({ intro: ev.target.value })} maxLength={1500} />
        </Field>
        <ListEditor label={L ? "Especificaciones" : "Specs"} hint={L ? "Etiquetas cortas bajo el texto: 500 mg · 30 cápsulas…" : "Short tags: 500 mg · 30 capsules…"} values={cur.specs} onChange={(v) => setCur({ specs: v })} max={6} addLabel={L ? "Agregar etiqueta" : "Add tag"} />
        <Field label={L ? "Dosis recomendada" : "Recommended dose"} htmlFor={`dosage-${lang}`} hint={L ? 'Ej.: "Porción recomendada: 1 cápsula al día."' : 'E.g.: "Recommended serving: 1 capsule daily."'}>
          <Input id={`dosage-${lang}`} value={cur.dosage} onChange={(ev) => setCur({ dosage: ev.target.value })} maxLength={300} />
        </Field>

        <div className="rounded-lg border border-[#e1e8ee] p-4">
          <p className="mb-3 text-sm font-bold text-heading-dark">{L ? "Tarjeta del catálogo" : "Catalog card"}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={L ? "Etiqueta superior" : "Top badge"} htmlFor={`card-badge-${lang}`}>
              <Input id={`card-badge-${lang}`} value={cur.card.badge} onChange={(ev) => setCur({ card: { ...cur.card, badge: ev.target.value } })} />
            </Field>
            <Field label={L ? "Subtítulo de la tarjeta" : "Card tagline"} htmlFor={`card-tag-${lang}`}>
              <Input id={`card-tag-${lang}`} value={cur.card.tagline} onChange={(ev) => setCur({ card: { ...cur.card, tagline: ev.target.value } })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={L ? "Descripción" : "Description"} htmlFor={`card-desc-${lang}`}>
                <Textarea id={`card-desc-${lang}`} value={cur.card.desc} onChange={(ev) => setCur({ card: { ...cur.card, desc: ev.target.value } })} maxLength={400} />
              </Field>
            </div>
            <Field label={L ? "Dosis" : "Strength"} htmlFor={`card-spec-${lang}`}>
              <Input id={`card-spec-${lang}`} value={cur.card.spec} onChange={(ev) => setCur({ card: { ...cur.card, spec: ev.target.value } })} placeholder="500 mg" />
            </Field>
            <Field label={L ? "Presentación" : "Count"} htmlFor={`card-count-${lang}`}>
              <Input id={`card-count-${lang}`} value={cur.card.count} onChange={(ev) => setCur({ card: { ...cur.card, count: ev.target.value } })} placeholder={L ? "30 cápsulas" : "30 capsules"} />
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-[#e1e8ee] p-4">
          <p className="mb-3 text-sm font-bold text-heading-dark">SEO</p>
          <div className="grid gap-3">
            <Field label={L ? "Título de la página" : "Page title"} htmlFor={`seo-title-${lang}`} hint={L ? "Si lo dejas vacío se usa el nombre." : "Falls back to the name if empty."}>
              <Input id={`seo-title-${lang}`} value={cur.seo.title} onChange={(ev) => setCur({ seo: { ...cur.seo, title: ev.target.value } })} maxLength={120} />
            </Field>
            <Field label={L ? "Descripción para buscadores" : "Meta description"} htmlFor={`seo-desc-${lang}`}>
              <Textarea id={`seo-desc-${lang}`} value={cur.seo.description} onChange={(ev) => setCur({ seo: { ...cur.seo, description: ev.target.value } })} maxLength={300} />
            </Field>
          </div>
        </div>
        <Field label={L ? "Título de «Productos relacionados»" : "«Related products» heading"} htmlFor={`rel-heading-${lang}`}>
          <Input id={`rel-heading-${lang}`} value={cur.relatedHeading} onChange={(ev) => setCur({ relatedHeading: ev.target.value })} />
        </Field>
      </Card>

      {/* 4. Beneficios */}
      <Card>
        <h2 className="mb-1 font-raleway text-lg font-bold text-heading-dark">Beneficios</h2>
        <p className="mb-4 text-xs text-slate">Se muestran como una línea de tiempo con su ícono. Textos en español e inglés juntos.</p>
        <BenefitsEditor items={benefits} onChange={setBenefits} />
      </Card>

      {/* 5. Tabla nutricional */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-raleway text-lg font-bold text-heading-dark">Tabla nutricional</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copyNutrition} className={btnGhost}>
              Copiar desde {lang === "es" ? "inglés" : "español"}
            </button>
            <LangTabs lang={lang} onChange={setLang} />
          </div>
        </div>
        <NutritionEditor lang={lang} value={cur.nutrition} onChange={(n) => setCur({ nutrition: n })} />
      </Card>

      {/* 6. Relacionados */}
      <Card>
        <h2 className="mb-4 font-raleway text-lg font-bold text-heading-dark">Productos relacionados</h2>
        <RelatedEditor items={related} options={options} onChange={setRelated} />
      </Card>

      {/* 7. Colores */}
      <Card>
        <h2 className="mb-1 font-raleway text-lg font-bold text-heading-dark">Colores de la ficha</h2>
        <p className="mb-4 text-xs text-slate">Por defecto usa los colores de la marca.</p>
        <div className="grid gap-4 sm:grid-cols-4">
          {(
            [
              ["accent", "Principal"],
              ["dark", "Títulos"],
              ["head", "Encabezado de la tabla"],
              ["tint", "Fondo suave"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={`theme-${key}`} className="mb-1.5 block text-sm font-semibold text-ink">
                {label}
              </label>
              <div className="flex items-center gap-2">
                <input id={`theme-${key}`} type="color" value={theme[key]} onChange={(ev) => setTheme({ ...theme, [key]: ev.target.value.toUpperCase() })} className="h-10 w-12 cursor-pointer rounded border border-[#d7dee6] bg-white p-1" />
                <code className="text-xs text-slate">{theme[key]}</code>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg p-4" style={{ background: theme.tint }}>
          <span className="rounded px-3 py-1.5 text-sm font-semibold text-white" style={{ background: theme.accent }}>Botón</span>
          <span className="font-raleway text-lg font-bold" style={{ color: theme.dark }}>Título de ejemplo</span>
          <span className="rounded px-3 py-1.5 text-sm font-semibold text-white" style={{ background: theme.head }}>Tabla</span>
        </div>
      </Card>

      {/* Estado + guardar */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-[#e1e8ee] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <Checkbox
              name="active"
              label="Producto activo (visible y comprable en la tienda)"
              checked={active}
              onChange={(ev) => setActive(ev.target.checked)}
            />
            {missing.length > 0 ? (
              <p className={`text-xs ${active ? "font-semibold text-[#c62828]" : "text-[#a96400]"}`}>
                {active ? "Para activarlo falta: " : "Incompleto (se guarda como borrador). Falta: "}
                {missing.map((m) => m.label).join(", ")}.
              </p>
            ) : (
              <p className="text-xs text-[#2e7d32]">Ficha completa: se puede activar.</p>
            )}
            <Flash ok={state.ok} message={state.message} />
          </div>
          <div className="flex items-center gap-3">
            {product && (
              <>
                <a href={`/${product.slug}/`} target="_blank" rel="noreferrer" className={btnGhost}>
                  Ver ficha (ES)
                </a>
                <a href={`/en/${product.slug}/`} target="_blank" rel="noreferrer" className={btnGhost}>
                  Ver ficha (EN)
                </a>
              </>
            )}
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
