import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClockIcon } from "@/components/icons";
import NutritionTable from "@/components/NutritionTable";
import ProductGallery from "@/components/ProductGallery";
import Breadcrumb from "@/components/Breadcrumb";
import { DashesEyebrow } from "@/components/DashesEyebrow";
import ProductCard from "@/components/ProductCard";
import AddToCart from "@/components/shop/AddToCart";
import StickyBuyBar from "@/components/shop/StickyBuyBar";
import TrustBadges from "@/components/shop/TrustBadges";
import { productThemeStyle } from "@/data/product-themes";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { getCatalog } from "@/lib/shop/catalog";
import { getProductBySlug, getProducts } from "@/lib/shop/content";
import { buyLabels } from "@/lib/shop/labels";
import { SITE_URL } from "@/lib/site";

// Las fichas existentes se generan en el build; las que se creen después (desde el panel) se
// generan en la primera visita. Una ficha inexistente o inactiva responde 404.
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!hasLocale(lang) || !product) return {};
  return pageMetadata({
    lang,
    path: `/${slug}/`,
    title: product[lang].seo.title,
    description: product[lang].seo.description,
    image: product.heroImage.src,
  });
}

/** El JSON-LD va dentro de un <script>: se escapa "<" porque el texto ahora viene de la base de datos. */
const safeJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export default async function ProductPage({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [all, catalog, dict] = await Promise.all([getProducts(), getCatalog(), getDictionary(lang)]);
  const product = all.find((x) => x.slug === slug);
  if (!product) notFound();

  const offer = catalog.items[slug];
  const p = product[lang];
  const [dosageLabel, ...dosageRest] = p.dosage.split(":");
  const abs = (src: string) => (src.startsWith("http") ? src : `${SITE_URL}${src}`);
  const label = product.labelImage[lang];

  const related = p.related
    .map((r) => ({ ...r, product: all.find((x) => x.slug === r.slug) }))
    .filter((r): r is typeof r & { product: NonNullable<typeof r.product> } => !!r.product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.seo.description,
    image: abs(product.heroImage.src),
    brand: { "@type": "Brand", name: "Nuvitt" },
    url: `${SITE_URL}${localePath(lang, `/${slug}/`)}`,
    ...(offer && {
      offers: {
        "@type": "Offer",
        price: offer.price_usd.toFixed(2),
        priceCurrency: "USD",
        availability: offer.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: `${SITE_URL}${localePath(lang, `/${slug}/`)}`,
      },
    }),
  };

  const labels = buyLabels(dict);
  const shopOn = catalog.enabled && !!offer;
  const tint = product.theme?.tint ?? "#d8e9f3";
  const crumbs = [
    { label: dict.common.breadcrumbHome, href: localePath(lang, "/") },
    { label: dict.nav.products, href: localePath(lang, "/productos/") },
    { label: p.name },
  ];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${SITE_URL}${c.href ?? localePath(lang, `/${slug}/`)}`,
    })),
  };

  return (
    <div style={productThemeStyle(product.theme)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbLd) }} />
      <Breadcrumb items={crumbs} label={dict.common.breadcrumbLabel} />

      {/* Hero */}
      <section className="py-8 min-[1025px]:pb-[84px] min-[1025px]:pt-[40px]">
        <div className="container-nv grid items-center gap-10 min-[1025px]:grid-cols-[1fr_540px] min-[1025px]:gap-[60px]">
          <ProductGallery
            dotLabel={dict.product.imageNav}
            tint={tint}
            images={[
              { ...product.heroImage, alt: dict.product.bottleAlt.replace("{name}", p.name) },
              ...(label ? [{ ...label, alt: dict.product.labelAlt.replace("{name}", p.name) }] : []),
            ]}
          />

          <div>
            <h1 className="font-raleway text-[36px] font-bold leading-[1.05] text-heading-dark min-[1025px]:text-[42px] min-[1025px]:leading-[42px]">
              {p.name}
            </h1>
            {p.tagline && (
              <h2 className="mt-3 font-manrope text-xl font-medium leading-5 text-link-blue">{p.tagline}</h2>
            )}
            {p.intro && <p className="mt-5 text-base leading-6 text-body">{p.intro}</p>}

            {p.specs.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-4">
                {p.specs.map((spec) => (
                  <li
                    key={spec}
                    className="rounded border border-primary-light2 px-3.5 py-[11px] font-manrope text-[15px] font-semibold leading-[15px] text-link-blue"
                  >
                    {spec}
                  </li>
                ))}
              </ul>
            )}

            {p.dosage && (
              <div className="mt-6 flex items-center gap-4 rounded-2xl bg-product-bg px-6 py-[22px]">
                <ClockIcon className="size-[22px] shrink-0 text-link-blue" />
                <p className="text-base leading-6 text-secondary">
                  {dosageRest.length > 0 ? (
                    <>
                      <strong className="font-semibold text-heading-dark">{dosageLabel}:</strong>
                      {dosageRest.join(":")}
                    </>
                  ) : (
                    p.dosage
                  )}
                </p>
              </div>
            )}

            {shopOn && offer && (
              <>
                <AddToCart
                  lang={lang}
                  slug={slug}
                  labels={labels}
                  initial={{ id: offer.id, usd: offer.price_usd, stock: offer.stock, rate: catalog.rate }}
                />
                <div className="mt-5">
                  <TrustBadges labels={dict.shop.trust} />
                </div>
                <StickyBuyBar
                  lang={lang}
                  slug={slug}
                  name={p.name}
                  image={product.image}
                  tint={tint}
                  initial={{ id: offer.id, usd: offer.price_usd, stock: offer.stock }}
                  labels={labels}
                  targetId="buy-box"
                />
              </>
            )}

            <div className={`mt-6 flex flex-wrap items-center ${shopOn ? "gap-x-6 gap-y-3" : "gap-5"}`}>
              {shopOn ? (
                <>
                  <Link href={localePath(lang, "/contacto/")} className="font-manrope text-[15px] font-semibold text-link-blue underline-offset-4 hover:underline">
                    {dict.common.contactUs}
                  </Link>
                  <Link href={localePath(lang, "/productos/")} className="font-manrope text-[15px] font-semibold text-link-blue underline-offset-4 hover:underline">
                    {dict.common.viewMoreProducts}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={localePath(lang, "/contacto/")}
                    className="rounded bg-link-blue px-7 py-[18px] font-manrope text-base font-semibold leading-4 text-white transition-colors hover:bg-primary-dark"
                  >
                    {dict.common.contactUs}
                  </Link>
                  <Link
                    href={localePath(lang, "/productos/")}
                    className="rounded border border-primary-light2 px-7 py-[18px] font-manrope text-base font-semibold leading-4 text-link-blue transition-colors hover:bg-product-bg"
                  >
                    {dict.common.viewMoreProducts}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabla nutricional + beneficios */}
      {(p.nutrition.rows.length > 0 || p.benefits.length > 0) && (
        <section className="bg-product-bg py-14 min-[1025px]:py-[70px]">
          <div className="container-nv">
            <DashesEyebrow className="text-sm font-semibold uppercase text-link-blue">
              {dict.product.benefits}
            </DashesEyebrow>
            {p.nutrition.title && (
              <h2 className="mt-4 font-raleway text-[32px] font-bold leading-[1] text-heading-dark min-[1025px]:text-[38px]">
                {p.nutrition.title}
              </h2>
            )}

            <div
              className={`mt-8 grid gap-12 ${
                p.nutrition.rows.length > 0 && p.benefits.length > 0 ? "min-[1025px]:grid-cols-[520px_1fr] min-[1025px]:gap-[84px]" : ""
              }`}
            >
              {p.nutrition.rows.length > 0 && (
                <NutritionTable nutrition={p.nutrition} amountHeader={dict.product.amountHeader} />
              )}

              {p.benefits.length > 0 && (
                <ol className="relative">
                  {p.benefits.map((b, i) => {
                    const icon = product.icons[i];
                    const last = i === p.benefits.length - 1;
                    return (
                      <li key={`${b.title}-${i}`} className="relative flex gap-[30px] pb-9 last:pb-0">
                        {!last && (
                          <span
                            aria-hidden="true"
                            className="absolute left-[26px] top-[54px] h-[calc(100%-54px)] w-[2px] bg-link-blue"
                          />
                        )}
                        <span className="relative z-[1] grid size-[54px] shrink-0 place-items-center rounded-full bg-white text-link-blue shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                          {icon && (
                            <svg viewBox={icon.viewBox} className="size-[22px]" fill="currentColor" aria-hidden="true">
                              {icon.d.map((d, n) => (
                                <path key={n} d={d} />
                              ))}
                            </svg>
                          )}
                        </span>
                        <div className="pt-[2px]">
                          <h3 className="font-raleway text-[25px] font-bold leading-[25px] text-heading-dark">{b.title}</h3>
                          <p className="mt-2.5 max-w-[420px] text-base leading-6 text-body">{b.text}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="py-14 min-[1025px]:py-[80px]">
          <div className="mx-auto w-[min(100%-2rem,1140px)]">
            {p.relatedHeading && (
              <h2 className="font-raleway text-[32px] font-bold leading-[1] text-heading-dark min-[1025px]:text-[38px]">
                {p.relatedHeading}
              </h2>
            )}
            <ul className="mt-6 grid gap-x-6 gap-y-[96px] md:grid-cols-3">
              {related.map((r) => {
                const o = catalog.enabled ? catalog.items[r.slug] : undefined;
                return (
                  <li key={r.slug}>
                    <ProductCard
                      product={r.product}
                      lang={lang}
                      viewLabel={dict.common.viewProduct}
                      offer={o && { id: o.id, usd: o.price_usd, stock: o.stock, rate: catalog.rate }}
                      labels={labels}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
