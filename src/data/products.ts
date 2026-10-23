import data from "./products.json";
import type { Locale } from "@/lib/i18n";

export type CategoryKey =
  | "balance-renal"
  | "cardiovascular-vitalidad"
  | "inmune"
  | "longevidad-piel"
  | "movilidad"
  | "sueno";

export const categoryKeys: CategoryKey[] = [
  "balance-renal",
  "cardiovascular-vitalidad",
  "inmune",
  "longevidad-piel",
  "movilidad",
  "sueno",
];

export type NutritionRow = {
  name: string[];
  amount: string;
  dv: string;
  note?: boolean;
};

export type ProductLocale = {
  name: string;
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

/** Imagen lista para next/image (de /public/images o subida a PocketBase). */
export type ImageRef = { src: string; width: number; height: number };

/** Paleta propia de cada ficha. */
export type ThemeColors = { accent: string; dark: string; head: string; tint: string };

export type BenefitIconPaths = { viewBox: string; d: string[] };

/** Producto tal como lo consume el sitio, venga de PocketBase o del respaldo products.json. */
export type Product = {
  slug: string;
  /** Frasco usado en catálogo, home y relacionados. */
  image: ImageRef;
  /** Imagen principal de la ficha. */
  heroImage: ImageRef;
  /** Etiqueta/supplement facts según idioma; null si no hay. */
  labelImage: Record<Locale, ImageRef | null>;
  categories: CategoryKey[];
  /** Un ícono por beneficio (mismo índice); undefined si falta. */
  icons: (BenefitIconPaths | undefined)[];
  theme: ThemeColors | null;
} & Record<Locale, ProductLocale>;

/** Forma del respaldo products.json (imágenes por nombre de archivo en /public/images). */
export type RawProduct = {
  slug: string;
  image: string;
  heroImage: string;
  labelImage: Record<Locale, string>;
  categories: CategoryKey[];
  icons: BenefitIconPaths[];
} & Record<Locale, ProductLocale>;

export const rawProducts = data as unknown as RawProduct[];
