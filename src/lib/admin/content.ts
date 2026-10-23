/**
 * Forma, normalización y requisitos de la ficha completa de un producto.
 * Lo usan el editor (cliente, para el indicador de completitud) y la Server Action (servidor).
 */
import { getBenefitIcon } from "@/data/benefit-icons";

export type NutritionRow = { name: string[]; amount: string; dv: string; note?: boolean };

export type ContentLocale = {
  tagline: string;
  intro: string;
  specs: string[];
  dosage: string;
  card: { badge: string; tagline: string; desc: string; spec: string; count: string };
  nutrition: {
    title: string;
    subtitle: string;
    serving: string[];
    dvHeader: string;
    rows: NutritionRow[];
    footnote: string;
    others: string;
  };
  benefits: { title: string; text: string }[];
  relatedHeading: string;
  related: { slug: string; desc: string }[];
  seo: { title: string; description: string };
};

export type MediaSlot = "bottle" | "hero" | "label_es" | "label_en";
export const MEDIA_SLOTS: MediaSlot[] = ["bottle", "hero", "label_es", "label_en"];
export type MediaEntry = { ref: string; w: number; h: number };
export type Theme = { accent: string; dark: string; head: string; tint: string };
export type Shared = { media: Partial<Record<MediaSlot, MediaEntry>>; icons: string[]; theme: Theme | null };

/** Colores de la marca Nuvitt, valores por defecto de una ficha nueva. */
export const DEFAULT_THEME: Theme = { accent: "#2E8BC0", dark: "#1D5C82", head: "#22B8DC", tint: "#D8E9F3" };

export const emptyContent = (): ContentLocale => ({
  tagline: "",
  intro: "",
  specs: [],
  dosage: "",
  card: { badge: "", tagline: "", desc: "", spec: "", count: "" },
  nutrition: { title: "", subtitle: "", serving: [], dvHeader: "", rows: [], footnote: "", others: "" },
  benefits: [],
  relatedHeading: "",
  related: [],
  seo: { title: "", description: "" },
});

/** Completa los huecos de un contenido leído de la base (campos que falten quedan vacíos). */
export function withDefaults(c: Partial<ContentLocale> | null | undefined): ContentLocale {
  const d = emptyContent();
  const x = c ?? {};
  return {
    ...d,
    ...x,
    card: { ...d.card, ...x.card },
    nutrition: { ...d.nutrition, ...x.nutrition, rows: x.nutrition?.rows ?? [], serving: x.nutrition?.serving ?? [] },
    seo: { ...d.seo, ...x.seo },
    specs: x.specs ?? [],
    benefits: x.benefits ?? [],
    related: x.related ?? [],
  } as ContentLocale;
}

const t = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, max: number, items: number) =>
  (Array.isArray(v) ? v : []).map((s) => t(s, max)).filter(Boolean).slice(0, items);

/** Limpia lo que llega del formulario: recorta textos, descarta vacíos y limita tamaños. */
export function normalizeContent(raw: unknown): ContentLocale {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const card = r.card ?? {};
  const nut = r.nutrition ?? {};
  return {
    tagline: t(r.tagline, 160),
    intro: t(r.intro, 1500),
    specs: list(r.specs, 80, 8),
    dosage: t(r.dosage, 300),
    card: {
      badge: t(card.badge, 80),
      tagline: t(card.tagline, 120),
      desc: t(card.desc, 400),
      spec: t(card.spec, 80),
      count: t(card.count, 80),
    },
    nutrition: {
      title: t(nut.title, 120),
      subtitle: t(nut.subtitle, 160),
      serving: list(nut.serving, 120, 6),
      dvHeader: t(nut.dvHeader, 20),
      rows: (Array.isArray(nut.rows) ? nut.rows : [])
        .map((row: Record<string, unknown>) => ({
          name: list(row?.name, 120, 4),
          amount: t(row?.amount, 60),
          dv: t(row?.dv, 20),
          ...(row?.note ? { note: true } : {}),
        }))
        .filter((row: NutritionRow) => row.name.length > 0)
        .slice(0, 60),
      footnote: t(nut.footnote, 400),
      others: t(nut.others, 800),
    },
    // Beneficios y relacionados se filtran por pares ES/EN en alignPairs, para no desalinear íconos.
    benefits: (Array.isArray(r.benefits) ? r.benefits : [])
      .map((b: Record<string, unknown>) => ({ title: t(b?.title, 100), text: t(b?.text, 400) }))
      .slice(0, 8),
    relatedHeading: t(r.relatedHeading, 120),
    related: (Array.isArray(r.related) ? r.related : [])
      .map((x: Record<string, unknown>) => ({ slug: t(x?.slug, 120), desc: t(x?.desc, 200) }))
      .slice(0, 3),
    seo: { title: t(r.seo?.title, 120), description: t(r.seo?.description, 300) },
  };
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export function normalizeTheme(raw: unknown): Theme {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const pick = (k: keyof Theme) => (typeof r[k] === "string" && HEX.test(r[k] as string) ? (r[k] as string).toUpperCase() : DEFAULT_THEME[k]);
  return { accent: pick("accent"), dark: pick("dark"), head: pick("head"), tint: pick("tint") };
}

/** Ids de ícono válidos, alineados con los beneficios ("" si no se eligió o no existe). */
export function normalizeIcons(raw: unknown, benefits: number): string[] {
  const ids = Array.isArray(raw) ? raw : [];
  return Array.from({ length: benefits }, (_, i) => (typeof ids[i] === "string" && getBenefitIcon(ids[i]) ? (ids[i] as string) : ""));
}

export type Requirement = { key: string; label: string };

/** Lo que debe estar completo para activar un producto en la tienda. */
export function missingForActivation(input: {
  price: number | null;
  media: Partial<Record<MediaSlot, unknown>>;
  es: ContentLocale;
  en: ContentLocale;
}): Requirement[] {
  const out: Requirement[] = [];
  if (!(input.price && input.price > 0)) out.push({ key: "price", label: "Precio mayor a 0" });
  if (!input.media.bottle) out.push({ key: "bottle", label: "Imagen del frasco (catálogo)" });
  if (!input.media.hero) out.push({ key: "hero", label: "Imagen principal de la ficha" });
  for (const [lang, c] of [["ES", input.es], ["EN", input.en]] as const) {
    if (!c.tagline) out.push({ key: `tagline_${lang}`, label: `Subtítulo (${lang})` });
    if (!c.intro) out.push({ key: `intro_${lang}`, label: `Introducción (${lang})` });
    if (!c.card.desc) out.push({ key: `card_${lang}`, label: `Descripción de la tarjeta (${lang})` });
  }
  return out;
}

/**
 * Beneficios e íconos van emparejados (mismo índice en ES, EN e íconos) y los relacionados comparten
 * slug en ambos idiomas: se descartan por pares para que nada quede desalineado.
 */
export function alignPairs(es: ContentLocale, en: ContentLocale, icons: string[], validSlugs: Set<string>, ownSlug: string) {
  const n = Math.max(es.benefits.length, en.benefits.length);
  const keep: number[] = [];
  for (let i = 0; i < n; i++) {
    const e = es.benefits[i];
    const g = en.benefits[i];
    if (e?.title || e?.text || g?.title || g?.text) keep.push(i);
  }
  const blank = { title: "", text: "" };
  const out = {
    es: { ...es, benefits: keep.map((i) => es.benefits[i] ?? blank) },
    en: { ...en, benefits: keep.map((i) => en.benefits[i] ?? blank) },
    icons: keep.map((i) => icons[i] ?? ""),
  };
  const m = Math.max(es.related.length, en.related.length);
  const rel: { slug: string; es: string; en: string }[] = [];
  for (let i = 0; i < m; i++) {
    const slug = es.related[i]?.slug || en.related[i]?.slug;
    if (slug && slug !== ownSlug && validSlugs.has(slug) && !rel.some((r) => r.slug === slug)) {
      rel.push({ slug, es: es.related[i]?.desc ?? "", en: en.related[i]?.desc ?? "" });
    }
  }
  out.es.related = rel.map((r) => ({ slug: r.slug, desc: r.es }));
  out.en.related = rel.map((r) => ({ slug: r.slug, desc: r.en }));
  return out;
}
