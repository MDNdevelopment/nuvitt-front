import type { Dictionary } from "@/dictionaries/es";
import type { Locale } from "./i18n";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  es: () => import("@/dictionaries/es").then((m) => m.default),
  en: () => import("@/dictionaries/en").then((m) => m.default),
};

export const getDictionary = (lang: Locale) => dictionaries[lang]();
