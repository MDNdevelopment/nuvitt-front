import "server-only";
import { cache } from "react";
import { getBenefitIcon } from "@/data/benefit-icons";
import { themeFor } from "@/data/product-themes";
import {
  categoryKeys,
  rawProducts,
  type CategoryKey,
  type ImageRef,
  type Product,
  type ProductLocale,
  type RawProduct,
  type ThemeColors,
} from "@/data/products";
import { img } from "@/lib/images";
import { pb, pbUrl } from "@/lib/pb";
import { SHOP_ENABLED } from "@/lib/site";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const cacheOpts = { next: { revalidate: 60, tags: ["catalog"] } };

// ---------- respaldo: products.json ----------
const tryImg = (name: string): ImageRef | null => {
  try {
    return img(name);
  } catch {
    return null;
  }
};

function fromRaw(r: RawProduct): Product {
  return {
    slug: r.slug,
    image: img(r.image),
    heroImage: img(r.heroImage),
    labelImage: { es: tryImg(r.labelImage.es), en: tryImg(r.labelImage.en) },
    categories: r.categories,
    icons: r.icons,
    theme: themeFor(r.slug),
    es: r.es,
    en: r.en,
  };
}

// ---------- base de datos ----------
type MediaRef = { ref?: string; w?: number; h?: number } | undefined;
type Content = Partial<ProductLocale> & { card?: Partial<ProductLocale["card"]>; nutrition?: Partial<ProductLocale["nutrition"]>; seo?: Partial<ProductLocale["seo"]> };

type DbProduct = {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  categories: string[] | null;
  content_es: Content | null;
  content_en: Content | null;
  shared: { media?: Record<string, MediaRef>; icons?: string[]; theme?: ThemeColors | null } | null;
};

function resolveMedia(rec: DbProduct, m: MediaRef): ImageRef | null {
  if (!m?.ref) return null;
  if (m.ref.startsWith("legacy:")) return tryImg(m.ref.slice(7));
  if (m.ref.startsWith("pb:") && m.w && m.h) {
    return { src: `${pbUrl()}/api/files/products/${rec.id}/${m.ref.slice(3)}`, width: m.w, height: m.h };
  }
  return null;
}

function toLocale(name: string, c: Content | null): ProductLocale {
  const x = c ?? {};
  const intro = x.intro ?? "";
  return {
    name,
    tagline: x.tagline ?? "",
    intro,
    specs: x.specs ?? [],
    dosage: x.dosage ?? "",
    card: { badge: "", tagline: x.tagline ?? "", desc: "", spec: "", count: "", ...x.card },
    nutrition: { title: "", subtitle: "", serving: [], dvHeader: "", rows: [], footnote: "", others: "", ...x.nutrition },
    benefits: x.benefits ?? [],
    relatedHeading: x.relatedHeading ?? "",
    related: x.related ?? [],
    seo: { title: x.seo?.title || name, description: x.seo?.description || intro.slice(0, 160) },
  };
}

function fromDb(rec: DbProduct): Product | null {
  const media = rec.shared?.media ?? {};
  const image = resolveMedia(rec, media.bottle);
  const heroImage = resolveMedia(rec, media.hero) ?? image;
  if (!image || !heroImage) return null; // sin foto no se puede mostrar
  return {
    slug: rec.slug,
    image,
    heroImage,
    labelImage: { es: resolveMedia(rec, media.label_es), en: resolveMedia(rec, media.label_en) },
    categories: (rec.categories ?? []).filter((c): c is CategoryKey => (categoryKeys as string[]).includes(c)),
    icons: (rec.shared?.icons ?? []).map((id) => getBenefitIcon(id)),
    theme: rec.shared?.theme ?? null,
    es: toLocale(rec.name_es, rec.content_es),
    en: toLocale(rec.name_en, rec.content_en),
  };
}

/**
 * Productos que se muestran en el sitio. Con la tienda encendida manda la base de datos (solo los
 * activos); con la tienda apagada, o si el backend no responde durante el build, se usa products.json.
 * En producción un fallo en tiempo de ejecución se propaga: Next conserva la página anterior en vez
 * de reemplazarla con datos viejos.
 */
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!SHOP_ENABLED || !process.env.POCKETBASE_URL) return rawProducts.map(fromRaw);
  try {
    const res = await pb<{ items: DbProduct[] }>("/api/collections/products/records", {
      query: { perPage: 200, filter: "active = true", sort: "sort,name_es" },
      ...cacheOpts,
    });
    return res.items.map(fromDb).filter((p): p is Product => p !== null);
  } catch (e) {
    if (isBuild) return rawProducts.map(fromRaw);
    throw e;
  }
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}
