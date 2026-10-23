import { localePath, type Locale } from "@/lib/i18n";

/** Destino seguro tras iniciar sesión: solo rutas internas ("/algo/"), nunca URLs externas. */
export function safeNext(lang: Locale, next: unknown): string {
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") && next.length < 200) return next;
  return localePath(lang, "/cuenta/");
}
