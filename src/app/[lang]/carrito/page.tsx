import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CartView, { type CartMeta } from "@/components/shop/CartView";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { getProducts } from "@/lib/shop/content";
import { SHOP_ENABLED } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/carrito">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "/carrito/", title: dict.cart.meta.title, description: dict.cart.meta.description, noindex: true });
}

export default async function CartPage({ params }: PageProps<"/[lang]/carrito">) {
  const { lang } = await params;
  if (!hasLocale(lang) || !SHOP_ENABLED) notFound();
  const dict = await getDictionary(lang);
  const c = dict.cart;
  const products = await getProducts();

  const meta: CartMeta = Object.fromEntries(
    products.map((p) => [p.slug, { name: p[lang].name, ...p.image, href: localePath(lang, `/${p.slug}/`) }]),
  );

  return (
    <section className="py-10 min-[1025px]:py-[70px]">
      <div className="container-nv">
        <h1 className="mb-8 font-raleway text-[36px] font-bold leading-none text-heading-dark min-[1025px]:text-[44px]">{c.title}</h1>
        <CartView
          lang={lang}
          meta={meta}
          productsHref={localePath(lang, "/productos/")}
          checkoutHref={localePath(lang, "/checkout/")}
          labels={{
            empty: c.empty, emptyCta: c.emptyCta, product: c.product, unit: c.unit, subtotal: c.subtotal, remove: c.remove,
            loading: c.loading, unavailable: c.unavailable, stockLimit: c.stockLimit, notice: c.notice, checkout: c.checkout,
            continue: c.continue, total: c.total,
            quantity: dict.shop.quantity, increase: dict.shop.increase, decrease: dict.shop.decrease,
          }}
        />
      </div>
    </section>
  );
}
