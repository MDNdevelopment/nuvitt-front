import "server-only";
import { pb } from "@/lib/pb";
import { SHOP_ENABLED } from "@/lib/site";

export type CatalogItem = { id: string; slug: string; price_usd: number; stock: number };
export type Catalog = { enabled: boolean; rate: number; items: Record<string, CatalogItem> };

const EMPTY: Catalog = { enabled: false, rate: 0, items: {} };
const cache = { next: { revalidate: 60, tags: ["catalog"] } };
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

/**
 * Precios, stock y tasa vigentes de PocketBase (solo productos activos). Cacheado 60 s y con la
 * etiqueta "catalog": el panel la invalida al editar. Con la tienda apagada devuelve un catálogo
 * vacío. Si el backend falla durante el build también (el sitio sale sin precios); en ejecución el
 * error se propaga para que Next conserve la página anterior en vez de cachear una sin precios.
 */
export async function getCatalog(): Promise<Catalog> {
  if (!SHOP_ENABLED || !process.env.POCKETBASE_URL) return EMPTY;
  try {
    const [products, config] = await Promise.all([
      pb<{ items: CatalogItem[] }>("/api/collections/products/records", {
        query: { perPage: 200, filter: "active = true && price_usd > 0", fields: "id,slug,price_usd,stock" },
        ...cache,
      }),
      pb<{ rate: number }>("/api/shop/config", cache),
    ]);
    const items: Record<string, CatalogItem> = {};
    for (const p of products.items) items[p.slug] = p;
    return { enabled: true, rate: config.rate ?? 0, items };
  } catch (e) {
    if (isBuild) return EMPTY;
    throw e;
  }
}
