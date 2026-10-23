export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/**
 * URL pública de una ruta interna. El español vive en la raíz ("/productos/")
 * y el inglés bajo "/en/", igual que en el sitio de WordPress.
 */
export function localePath(lang: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.replace(/^\/?/, "/").replace(/\/?$/, "/");
  if (lang === defaultLocale) return clean === "" ? "/" : clean;
  return `/en${clean === "" ? "/" : clean}`;
}
