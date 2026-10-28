import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductsExplorer from "@/components/ProductsExplorer";
import { categoryKeys } from "@/data/products";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { getCatalog } from "@/lib/shop/catalog";
import { getProducts } from "@/lib/shop/content";
import { buyLabels } from "@/lib/shop/labels";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/productos">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({
    lang,
    path: "/productos/",
    title: dict.meta.products.title,
    description: dict.meta.products.description,
    image: "PROBIOTIC-ADVANTAGE-e1783705532190.webp",
  });
}

export default async function ProductsPage({ params }: PageProps<"/[lang]/productos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const [catalog, products] = await Promise.all([getCatalog(), getProducts()]);
  const labels = buyLabels(dict);

  return (
    <>
      <section className="bg-paper relative pt-4 min-[1025px]:pt-[6px]">
        <div aria-hidden="true" className="absolute inset-0 bg-white/70" />
        <div className="container-nv relative pb-12 pt-10">
          <h1 className="font-raleway text-[44px] font-bold leading-none tracking-[-0.03em] text-primary min-[1025px]:text-[60px]">
            {dict.products.title}
          </h1>
          <p className="mt-6 max-w-[573px] font-raleway text-[19px] leading-[30.4px] text-slate">
            {dict.products.subtitle}
          </p>
        </div>
      </section>

      <ProductsExplorer
        allLabel={dict.products.all}
        filterLabel={dict.products.filterLabel}
        emptyLabel={dict.products.empty}
        categories={categoryKeys.map((key) => ({ key, label: dict.products.categories[key] }))}
        countLabel={dict.products.count}
        countOneLabel={dict.products.countOne}
        items={products.map((product, i) => {
          const o = catalog.enabled ? catalog.items[product.slug] : undefined;
          const offer = o && { id: o.id, usd: o.price_usd, stock: o.stock, rate: catalog.rate };
          const card = (
            <ProductCard
              product={product}
              lang={lang}
              viewLabel={dict.common.viewProduct}
              priority={i < 3}
              offer={offer}
              labels={labels}
            />
          );
          return { slug: product.slug, categories: product.categories, node: card };
        })}
      />
    </>
  );
}
