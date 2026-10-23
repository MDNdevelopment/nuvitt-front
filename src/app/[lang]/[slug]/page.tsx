import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClockIcon } from "@/components/icons";
import NutritionTable from "@/components/NutritionTable";
import ProductGallery from "@/components/ProductGallery";
import { DashesEyebrow } from "@/components/DashesEyebrow";
import AddToCart from "@/components/shop/AddToCart";
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

  return (
    <div style={productThemeStyle(product.theme)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(jsonLd) }} />

      {/* Hero */}
      <section className="py-10 min-[1025px]:pb-[84px] min-[1025px]:pt-[105px]">
        <div className="container-nv grid items-center gap-10 min-[1025px]:grid-cols-[1fr_540px] min-[1025px]:gap-[60px]">
          <ProductGallery
            dotLabel={dict.product.imageNav}
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

            {catalog.enabled && offer && (
              <AddToCart
                lang={lang}
                slug={slug}
                labels={buyLabels(dict)}
                cartHref={localePath(lang, "/carrito/")}
                initial={{ id: offer.id, usd: offer.price_usd, stock: offer.stock, rate: catalog.rate }}
              />
            )}

            <div className="mt-6 flex flex-wrap gap-5">
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
            <ul className="mt-10 grid gap-[30px] px-[10px] md:grid-cols-3">
              {related.map((r) => {
                const href = localePath(lang, `/${r.slug}/`);
                return (
                  <li
                    key={r.slug}
                    className="flex items-center gap-5 rounded-[20px] border border-[#d0d4d8] bg-white p-[18px] shadow-[0_10px_25px_rgba(30,60,90,0.08)]"
                  >
                    <Link href={href} tabIndex={-1} aria-hidden="true" className="shrink-0">
                      <Image {...r.product.image} alt="" sizes="80px" className="h-[118px] w-auto" />
                    </Link>
                    <div>
                      <h3 className="font-manrope text-[19px] font-extrabold leading-[19px] text-[#0f5272]">
                        <Link href={href}>{r.product[lang].name}</Link>
                      </h3>
                      <p className="mt-3 font-manrope text-sm font-medium leading-5 text-body">{r.desc}</p>
                      <Link
                        href={href}
                        className="mt-3 inline-block rounded-full bg-primary-dark px-3 py-[7px] font-manrope text-xs font-medium leading-3 text-white transition-colors hover:bg-primary"
                      >
                        {dict.common.viewProduct}
                      </Link>
                    </div>
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
