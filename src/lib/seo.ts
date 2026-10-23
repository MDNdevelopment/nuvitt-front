import type { Metadata } from "next";
import { localePath, type Locale } from "./i18n";
import { SITE_URL } from "./site";

type Args = {
  lang: Locale;
  /** Ruta interna sin prefijo de idioma, p. ej. "/productos/". */
  path: string;
  title: string;
  description: string;
  /** Open Graph: archivo de /public/images, ruta absoluta del sitio ("/images/x.webp") o URL completa. */
  image?: string;
  /** Páginas privadas o sin valor SEO (carrito, cuenta): no indexar ni seguir enlaces. */
  noindex?: boolean;
};

const OG_LOCALE: Record<Locale, string> = { es: "es_VE", en: "en_US" };

export function pageMetadata({ lang, path, title, description, image, noindex }: Args): Metadata {
  const url = `${SITE_URL}${localePath(lang, path)}`;
  const imageUrl = image ? (image.startsWith("http") ? image : image.startsWith("/") ? `${SITE_URL}${image}` : `${SITE_URL}/images/${image}`) : undefined;
  const images = imageUrl ? [{ url: imageUrl }] : undefined;
  return {
    title,
    description,
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: url,
      languages: {
        es: `${SITE_URL}${localePath("es", path)}`,
        en: `${SITE_URL}${localePath("en", path)}`,
        "x-default": `${SITE_URL}${localePath("es", path)}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Nuvitt",
      title,
      description,
      url,
      locale: OG_LOCALE[lang],
      alternateLocale: OG_LOCALE[lang === "es" ? "en" : "es"],
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: images?.map((i) => i.url) },
  };
}
