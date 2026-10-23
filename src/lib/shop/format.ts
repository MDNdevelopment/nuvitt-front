import type { Locale } from "@/lib/i18n";

const tag = (lang: Locale) => (lang === "es" ? "es-VE" : "en-US");

export const formatUsd = (n: number, lang: Locale) =>
  new Intl.NumberFormat(tag(lang), { style: "currency", currency: "USD" }).format(n);

export const formatBs = (n: number, lang: Locale) =>
  `Bs ${new Intl.NumberFormat(tag(lang), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

/** Bs de un monto en USD con el mismo redondeo que el backend (centavos enteros × tasa). */
export const usdToBs = (usd: number, rate: number) => Math.round(Math.round(usd * 100) * rate) / 100;

export function formatDate(value: string, lang: Locale): string {
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(tag(lang), { dateStyle: "medium", timeZone: "America/Caracas" }).format(d);
}
