import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/shop/content";
import { localePath, locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const staticPaths = ["/", "/productos/", "/nosotros/", "/contacto/"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const paths = [...staticPaths, ...products.map((p) => `/${p.slug}/`)];
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${SITE_URL}${localePath(lang, path)}`,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path.split("/").length > 3 ? 0.7 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}${localePath(l, path)}`]),
        ),
      },
    })),
  );
}
