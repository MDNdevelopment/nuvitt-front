import { getCatalog } from "@/lib/shop/catalog";

/** Precios y stock vigentes para el carrito y los botones de compra (el HTML puede estar cacheado). */
export async function GET() {
  // Si el backend falla, el cliente conserva los datos del HTML (enabled: false).
  const catalog = await getCatalog().catch(() => ({ enabled: false, rate: 0, items: {} }));
  return Response.json(catalog, { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" } });
}
