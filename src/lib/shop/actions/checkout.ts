"use server";

import { normalizePhone } from "@/lib/admin/validate";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { pb, PBError } from "@/lib/pb";
import { SHOP_ENABLED } from "@/lib/site";
import { createCustomer } from "../auth";
import { clientIp, getCustomer } from "../session";
import { checkAccount, checkAddress, normCedula, paymentOk, type AccountInput, type AddressInput, type FieldErrors, type PaymentInput } from "../validate";

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

export type CheckoutError = "coupon" | "stock" | "unavailable" | "zone" | "rate" | "address" | "payment" | "disabled" | "emailTaken" | "fields" | "generic";
export type QuoteResult = { ok: true; quote: Quote } | { ok: false; error: CheckoutError };
export type PlaceResult =
  | { ok: true; number: number; status: string }
  | {
      ok: false;
      error: CheckoutError;
      message?: string;
      /** Errores por campo, para pintarlos en el formulario. */
      fieldErrors?: { account?: FieldErrors; address?: FieldErrors };
      /** La cuenta ya se creó (y hay sesión) aunque la compra falló: el cliente debe recargar para verla. */
      accountCreated?: boolean;
    };

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
  if (m.includes("datos de pago") || m.includes("transferencia") || m.includes("zelle")) return "payment";
  return "generic";
}

const ctx = (lang: string) => {
  if (!SHOP_ENABLED || !hasLocale(lang)) throw new Error("tienda no disponible");
  return lang;
};

const cleanLines = (items: Line[]): Line[] =>
  (Array.isArray(items) ? items : []).slice(0, 50).map((i) => ({ product: String(i.product), qty: Math.max(1, Math.min(99, Math.trunc(Number(i.qty) || 1))) }));

/** Totales calculados por el backend (precios, stock, cupón, envío y tasa vigentes). No exige sesión: el invitado también cotiza. */
export async function quoteAction(lang: string, input: { items: Line[]; zone: string; coupon: string }): Promise<QuoteResult> {
  ctx(lang);
  const session = await getCustomer();
  try {
    const quote = await pb<Quote>("/api/shop/quote", {
      method: "POST",
      token: session?.token,
      ip: await clientIp(),
      json: { items: cleanLines(input.items), zone: String(input.zone), coupon: String(input.coupon ?? "").slice(0, 40) },
    });
    return { ok: true, quote };
  } catch (e) {
    return { ok: false, error: classify(e) };
  }
}

const s = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

/** Datos de pago saneados, tal como los espera el backend. */
function cleanPayment(p: PaymentInput): PaymentInput {
  switch (p?.method) {
    case "transfer":
      return { method: "transfer", bank: s(p.bank, 4), reference: s(p.reference, 20) };
    case "zelle":
      return { method: "zelle", reference: s(p.reference, 40), payerName: s(p.payerName, 80) };
    default: {
      const c = p as Extract<PaymentInput, { method: "c2p" }>;
      return { method: "c2p", bank: s(c?.bank, 4), id: normCedula(s(c?.id, 20)), phone: s(c?.phone, 20), token: s(c?.token, 12) };
    }
  }
}

/** Cuerpo `payment` del backend (snake_case). */
function paymentBody(p: PaymentInput) {
  if (p.method === "zelle") return { method: p.method, reference: p.reference, payer_name: p.payerName };
  return { ...p };
}

export type PlaceInput = {
  items: Line[];
  zone: string;
  coupon: string;
  /** Dirección guardada del cliente, o una nueva que se guarda en su libreta. */
  address: { id: string } | { fields: AddressInput };
  /** Solo para invitados: se crea la cuenta justo antes de la orden. */
  account?: AccountInput;
  payment: PaymentInput;
};

/**
 * Checkout de una sola pantalla: valida todo, crea la cuenta si no hay sesión, guarda la dirección nueva,
 * crea la orden y cobra (C2P) o la deja por verificar (transferencia / Zelle). El backend recalcula todo.
 * Un resultado incierto (timeout) deja la orden "por verificar": la página de gracias lo explica.
 */
export async function placeOrderAction(lang: string, input: PlaceInput): Promise<PlaceResult> {
  const l = ctx(lang);
  const dict = await getDictionary(l as "es" | "en");
  const e = dict.account.errors;
  const session = await getCustomer();
  const payment = cleanPayment(input.payment);

  // 1) Validar todo antes de tocar nada (en particular, antes de crear la cuenta).
  const fieldErrors: NonNullable<Extract<PlaceResult, { ok: false }>["fieldErrors"]> = {};
  let account: AccountInput | null = null;
  if (!session) {
    const a = input.account;
    account = { name: s(a?.name, 120), email: s(a?.email, 200), phone: s(a?.phone, 30), cedula: normCedula(s(a?.cedula, 20)), password: String(a?.password ?? ""), passwordConfirm: String(a?.passwordConfirm ?? "") };
    const errs = checkAccount(account, e);
    if (Object.keys(errs).length) fieldErrors.account = errs;
  }
  let newAddress: AddressInput | null = null;
  if ("fields" in input.address) {
    const f = input.address.fields;
    newAddress = { label: s(f.label, 60), recipient: s(f.recipient, 120), phone: s(f.phone, 30), state: s(f.state, 80), city: s(f.city, 80), line: s(f.line, 300), reference: s(f.reference, 300) };
    const errs = checkAddress(newAddress, e);
    if (Object.keys(errs).length) fieldErrors.address = errs;
  } else if (!session) {
    return { ok: false, error: "address" }; // un invitado no tiene direcciones guardadas
  }
  if (fieldErrors.account || fieldErrors.address) return { ok: false, error: "fields", fieldErrors };
  if (!paymentOk(payment)) return { ok: false, error: "payment" };

  // 2) Cuenta: sin sesión se crea y se inicia sesión en la misma petición.
  let token = session?.token ?? "";
  let userId = session?.user.id ?? "";
  let accountCreated = false;
  if (!session && account) {
    const res = await createCustomer({ ...account, phone: normalizePhone(account.phone), email: account.email, lang: l });
    if (!res.ok) {
      if (res.reason === "emailTaken") return { ok: false, error: "emailTaken", fieldErrors: { account: { email: e.emailTaken } } };
      if (res.reason === "invalid") return { ok: false, error: "fields", fieldErrors: { account: Object.fromEntries((res.fields ?? []).map((k) => [k, e.required])) } };
      return { ok: false, error: "generic" };
    }
    token = res.token;
    userId = res.userId;
    accountCreated = true;
  }
  const fail = (r: Extract<PlaceResult, { ok: false }>): PlaceResult => (accountCreated ? { ...r, accountCreated: true } : r);

  // 3) Dirección nueva: se guarda en la libreta del cliente.
  let addressId = "id" in input.address ? s(input.address.id, 30) : "";
  if (newAddress) {
    try {
      const a = await pb<{ id: string }>("/api/collections/addresses/records", {
        method: "POST",
        token,
        json: { ...newAddress, phone: normalizePhone(newAddress.phone), user: userId },
      });
      addressId = a.id;
    } catch {
      return fail({ ok: false, error: "generic" });
    }
  }

  // 4) Orden y pago.
  try {
    const res = await pb<{ number: number; status: string }>("/api/shop/checkout", {
      method: "POST",
      token,
      ip: await clientIp(),
      json: {
        items: cleanLines(input.items),
        zone: s(input.zone, 30),
        address: addressId,
        coupon: s(input.coupon, 40),
        payment: paymentBody(payment),
      },
    });
    return { ok: true, number: res.number, status: res.status };
  } catch (err) {
    // 422: el banco rechazó el cobro; su mensaje es apto para mostrarlo al cliente.
    if (err instanceof PBError && err.status === 422) return fail({ ok: false, error: "generic", message: err.message });
    return fail({ ok: false, error: classify(err) });
  }
}
