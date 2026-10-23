import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BenefitsCarousel, { type BenefitSlide } from "@/components/BenefitsCarousel";
import CertificationsBar from "@/components/CertificationsBar";
import CommitmentSection from "@/components/CommitmentSection";
import HeroCarousel, { type HeroTile } from "@/components/HeroCarousel";
import PurewaySection from "@/components/PurewaySection";
import RetailersMarquee from "@/components/RetailersMarquee";
import RitualSection from "@/components/RitualSection";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { getProducts } from "@/lib/shop/content";
import { SITE_URL, contact } from "@/lib/site";

/** Orden y fondo de color de cada frasco en la grilla del hero. */
const HERO_TILES: { slug: string; bottle: string; bg: string }[] = [
  { slug: "probiotic-advantage", bottle: "PROBIOTIC-ADVANTAGE-e1783705532190.webp", bg: "FONDO-5-MORADO.webp" },
  { slug: "magnesium-glycinate", bottle: "magnesium-glycinate-e1783691294352.webp", bg: "FONDO.webp" },
  { slug: "melatonin-extra-strength", bottle: "melatonin.webp", bg: "FONDO-10-OSCURO.webp" },
  { slug: "potassium-citrate", bottle: "potassium-citrate.webp", bg: "FONDO-8-AZUL.webp" },
  { slug: "artiflex-advantage", bottle: "artiflex.webp", bg: "FONDO-1-ROJO.webp" },
  { slug: "vitamin-c-1000-mg", bottle: "vitamina-c-e1782315947797.webp", bg: "FONDO-2-NARANJA.webp" },
  { slug: "magnesium-citrate", bottle: "magnesium-citrate-e1784744130723.webp", bg: "FONDO-3-CELESTE.webp" },
  { slug: "omega-3-2000-mg", bottle: "omega-3-e1782316123764.webp", bg: "FONDO-4-AZUL.webp" },
  { slug: "zinc-citrate", bottle: "zinc.webp", bg: "FONDO-6-CELESTE.webp" },
  { slug: "resveratrol-complex", bottle: "resveratrol-e1782315797965.webp", bg: "FONDO-7-MORADO.webp" },
  { slug: "vitamin-e-268-mg", bottle: "598-x-799.webp", bg: "FONDO-23.webp" },
  { slug: "vitamin-d3-k2", bottle: "vitamina-d3.webp", bg: "FONDO-9-AMARILLO.webp" },
];

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({
    lang,
    path: "/",
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    image: "PROBIOTIC-ADVANTAGE-e1783705532190.webp",
  });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  // La grilla y los destacados siguen al catálogo: un producto oculto o desactivado no aparece.
  const catalog = await getProducts();
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));

  const tiles: HeroTile[] = HERO_TILES.flatMap((t) => {
    const product = bySlug.get(t.slug);
    return product ? [{ bottle: t.bottle, bg: t.bg, alt: product[lang].name }] : [];
  });

  const slides: BenefitSlide[] = dict.home.slides.map((s) => {
    const product = bySlug.get(s.product);
    return {
      title: s.title,
      text: s.text,
      cta: s.cta,
      ctaHref: localePath(lang, "/productos/"),
      image: s.image,
      imageAlt: "",
      product: product && {
        name: product[lang].name,
        href: localePath(lang, `/${product.slug}/`),
        image: product.image,
        alt: product[lang].name,
      },
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nuvitt",
    url: SITE_URL,
    logo: `${SITE_URL}/images/LOGO-NUVITT-TM.webp`,
    email: contact.email,
    telephone: contact.phone,
    sameAs: [contact.instagram],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroCarousel
        tiles={tiles}
        gridLabel={dict.home.hero.gridLabel}
        liposomal={dict.home.hero.liposomal}
        benefits={{ ...dict.home.hero.benefits, href: localePath(lang, "/productos/") }}
        prevLabel={dict.common.previous}
        nextLabel={dict.common.next}
      />
      <CertificationsBar items={dict.home.certifications} />
      <BenefitsCarousel
        slides={slides}
        featuredLabel={dict.home.featuredLabel}
        prevLabel={dict.common.previous}
        nextLabel={dict.common.next}
      />
      <PurewaySection lang={lang} dict={dict} />
      <RitualSection lang={lang} dict={dict} />
      <RetailersMarquee label={dict.home.retailersLabel} />
      <CommitmentSection lang={lang} dict={dict} />
    </>
  );
}
