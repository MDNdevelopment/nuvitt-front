import type { Product } from "@/data/products";
import type { Locale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import type { CartMeta } from "@/components/shop/CartView";

/** Datos de presentación de cada producto para el carrito y el panel lateral. */
export function buildCartMeta(products: Product[], lang: Locale): CartMeta {
  return Object.fromEntries(
    products.map((p) => [
      p.slug,
      {
        name: p[lang].name,
        ...p.image,
        href: localePath(lang, `/${p.slug}/`),
        tint: p.theme?.tint ?? "#d8e9f3",
        spec: `${p[lang].card.spec} · ${p[lang].card.count}`,
      },
    ]),
  );
}
