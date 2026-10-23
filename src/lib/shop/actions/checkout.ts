"use server";

import { hasLocale } from "@/lib/i18n";
import { pb, PBError } from "@/lib/pb";
import { SHOP_ENABLED } from "@/lib/site";
import { clientIp, requireCustomer } from "../session";

export type QuoteItem = { slug: string; name_es: string; name_en: string; price_usd: number; qty: number };
export type Quote = {
  items: QuoteItem[];
  subtotal_usd: number;
  discount_usd: number;
  shipping_usd: number;
  total_usd: number;
  rate: number;
  total_bs: number;
};

export type CheckoutError = "coupon" | "stock" | "unavailable" | "zone" | "rate" | "address" | "payment" | "disabled" | "generic";
export type QuoteResult = { ok: true; quote: Quote } | { ok: false; error: CheckoutError };
export type PayResult = { ok: true; number: number; status: string } | { ok: false; error: CheckoutError; message?: string };

type Line = { product: string; qty: number };

/** Traduce los mensajes (en español) del backend a un código que el cliente muestra en su idioma. */
function classify(e: unknown): CheckoutError {
  if (!(e instanceof PBError)) return "generic";
  const m = e.message.toLowerCase();
  if (e.status === 503 && m.includes("tasa")) return "rate";
  if (e.status === 503) return "disabled";
  if (m.includes("cupón") || m.includes("cupon")) return "coupon";
  if (m.includes("existencias")) return "stock";
  if (m.includes("disponible") || m.includes("precio")) return "unavailable";
  if (m.includes("zona")) return "zone";
  if (m.includes("dirección") || m.includes("direccion")) return "address";
  if (m.includes("datos de pago")) return "payment";
  return "generic";
}

const ctx = (lang: string) => {
  if (!SHOP_ENABLED || !hasLocale(lang)) throw new Error("tienda no disponible");
  return lang;
};

const cleanLines = (items: Line[]): Line[] =>
  (Array.isArray(items) ? items : []).slice(0, 50).map((i) => ({ product: String(i.product), qty: Math.max(1, Math.min(99, Math.trunc(Number(i.qty) || 1))) }));

/** Totales calculados por el backend (precios, stock, cupón, envío y tasa vigentes). */
export async function quoteAction(lang: string, input: { items: Line[]; zone: string; coupon: string }): Promise<QuoteResult> {
  const l = ctx(lang);
  const { token } = await requireCustomer(l);
  try {
    const quote = await pb<Quote>("/api/shop/quote", {
      method: "POST",
      token,
      json: { items: cleanLines(input.items), zone: String(input.zone), coupon: String(input.coupon ?? "").slice(0, 40) },
    });
    return { ok: true, quote };
  } catch (e) {
    return { ok: false, error: classify(e) };
  }
}

/**
 * Crea la orden y cobra por C2P. El backend recalcula todo; si el banco rechaza devuelve su mensaje.
 * Un resultado incierto (timeout) deja la orden "por verificar": la página de gracias lo explica.
 */
export async function payAction(
  lang: string,
  input: { items: Line[]; zone: string; address: string; coupon: string; payment: { bank: string; id: string; phone: string; token: string } },
): Promise<PayResult> {
  const l = ctx(lang);
  const { token } = await requireCustomer(l);
  try {
    const res = await pb<{ number: number; status: string }>("/api/shop/checkout", {
      method: "POST",
      token,
      ip: await clientIp(),
      json: {
        items: cleanLines(input.items),
        zone: String(input.zone),
        address: String(input.address),
        coupon: String(input.coupon ?? "").slice(0, 40),
        payment: {
          bank: String(input.payment.bank),
          id: String(input.payment.id),
          phone: String(input.payment.phone),
          token: String(input.payment.token),
        },
      },
    });
    return { ok: true, number: res.number, status: res.status };
  } catch (e) {
    // 422: el banco rechazó el cobro; su mensaje es apto para mostrarlo al cliente.
    if (e instanceof PBError && e.status === 422) return { ok: false, error: "generic", message: e.message };
    return { ok: false, error: classify(e) };
  }
}
