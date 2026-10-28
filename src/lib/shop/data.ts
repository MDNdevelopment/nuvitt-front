import "server-only";
import { pb } from "@/lib/pb";
import type { Address, Order, OrderEvent, Payment } from "./types";

export type ShippingZone = { id: string; name_es: string; name_en: string; price_usd: number; kind: string };

/** Zonas de envío activas (la regla pública de PocketBase solo devuelve las activas). */
export async function listActiveZones(token?: string) {
  return (await pb<{ items: ShippingZone[] }>("/api/collections/shipping_zones/records", { token, query: { perPage: 50, sort: "sort,name_es" } })).items;
}

export type PaymentConfig = {
  enabled: boolean;
  /** c2p: Pago Móvil automático; transfer / zelle: texto con los datos de la cuenta, o null si el método está apagado. */
  methods: { c2p: boolean; transfer: string | null; zelle: string | null };
};

/** Métodos de pago habilitados según el backend (credenciales de Banco Plaza, teléfono cobrador y datos de cuenta). */
export async function paymentConfig(): Promise<PaymentConfig> {
  try {
    const c = await pb<{ payments_enabled: boolean; methods?: Partial<PaymentConfig["methods"]> }>("/api/shop/config");
    const methods = { c2p: c.methods?.c2p === true, transfer: c.methods?.transfer ?? null, zelle: c.methods?.zelle ?? null };
    return { enabled: c.payments_enabled === true, methods };
  } catch {
    return { enabled: false, methods: { c2p: false, transfer: null, zelle: null } };
  }
}

type List<T> = { items: T[] };

export async function listAddresses(token: string) {
  return (await pb<List<Address>>("/api/collections/addresses/records", { token, query: { perPage: 50, sort: "-created" } })).items;
}

export async function getAddress(token: string, id: string): Promise<Address | null> {
  try {
    return await pb<Address>(`/api/collections/addresses/records/${id}`, { token });
  } catch {
    return null;
  }
}

/** Pedidos del cliente: las reglas de PocketBase ya limitan la lista a los suyos. */
export async function listOrders(token: string) {
  return (await pb<List<Order>>("/api/collections/orders/records", { token, query: { perPage: 100, sort: "-created" } })).items;
}

export async function getOrderByNumber(token: string, number: number): Promise<Order | null> {
  const res = await pb<List<Order>>("/api/collections/orders/records", { token, query: { perPage: 1, filter: `number = ${number}` } });
  return res.items[0] ?? null;
}

export async function listOrderEvents(token: string, orderId: string) {
  return (
    await pb<List<OrderEvent>>("/api/collections/order_events/records", {
      token,
      query: { perPage: 50, sort: "created", filter: `order = "${orderId}"` },
    })
  ).items;
}

export async function listOrderPayments(token: string, orderId: string) {
  return (
    await pb<List<Payment>>("/api/collections/payments/records", {
      token,
      query: { perPage: 10, sort: "-created", filter: `order = "${orderId}"` },
    })
  ).items;
}
