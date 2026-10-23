import "server-only";
import { pb, pbUrl } from "@/lib/pb";
import { ORDER_STATUSES } from "./order-flow";
import type { AdminEvent, AdminOrder, AdminPayment, Coupon, ListResult, Product, Settings, ShopConfig, UserRecord, Zone } from "./types";

const q = (s: string) => s.replace(/["\\]/g, "");
const clean = q;

export async function listProducts(token: string, opts: { search?: string; active?: "1" | "0" | "" } = {}) {
  const filters: string[] = [];
  if (opts.search) filters.push(`(name_es ~ "${q(opts.search)}" || name_en ~ "${q(opts.search)}" || sku ~ "${q(opts.search)}")`);
  if (opts.active === "1") filters.push("active = true");
  if (opts.active === "0") filters.push("active = false");
  const res = await pb<ListResult<Product>>("/api/collections/products/records", {
    token,
    query: { perPage: 200, sort: "sort,name_es", filter: filters.join(" && ") },
  });
  return res.items;
}

export const getProduct = (token: string, id: string) => pb<Product>(`/api/collections/products/records/${id}`, { token });

export async function listZones(token: string) {
  const res = await pb<ListResult<Zone>>("/api/collections/shipping_zones/records", { token, query: { perPage: 100, sort: "sort,name_es" } });
  return res.items;
}
export const getZone = (token: string, id: string) => pb<Zone>(`/api/collections/shipping_zones/records/${id}`, { token });

export async function listCoupons(token: string) {
  const res = await pb<ListResult<Coupon>>("/api/collections/coupons/records", { token, query: { perPage: 200, sort: "-created" } });
  return res.items;
}
export const getCoupon = (token: string, id: string) => pb<Coupon>(`/api/collections/coupons/records/${id}`, { token });

export async function getSettings(token: string): Promise<Settings> {
  const res = await pb<ListResult<Settings>>("/api/collections/settings/records", { token, query: { perPage: 1, sort: "created" } });
  if (!res.items[0]) throw new Error("No existe el registro de ajustes en el backend");
  return res.items[0];
}

/** Datos públicos del backend (tasa vigente y estado de pagos). Sin token. */
export const getShopConfig = () => pb<ShopConfig>("/api/shop/config");

/** URL de un archivo subido a un producto. */
/** URL de una imagen de la ficha: archivo del sitio (/public/images) o subida a PocketBase. */
export function mediaUrl(p: Pick<Product, "id">, ref: string | undefined, thumb = ""): string | null {
  if (!ref) return null;
  if (ref.startsWith("legacy:")) return `/images/${ref.slice(7)}`;
  if (ref.startsWith("pb:")) return productPhotoUrl(p, ref.slice(3), thumb);
  return null;
}

export const productPhotoUrl = (p: Pick<Product, "id">, file: string, thumb = "") =>
  `${pbUrl()}/api/files/products/${p.id}/${file}${thumb ? `?thumb=${thumb}` : ""}`;

// ---------- órdenes ----------
export const ORDERS_PER_PAGE = 25;

export async function listOrders(token: string, opts: { status?: string; search?: string; page?: number } = {}) {
  const filters: string[] = [];
  if (opts.status && (ORDER_STATUSES as string[]).includes(opts.status)) filters.push(`status = "${opts.status}"`);
  const q = (opts.search ?? "").trim();
  if (/^\d{1,9}$/.test(q)) filters.push(`number = ${q}`);
  else if (q) filters.push(`(user.email ~ "${clean(q)}" || user.name ~ "${clean(q)}")`);
  return pb<ListResult<AdminOrder>>("/api/collections/orders/records", {
    token,
    query: { perPage: ORDERS_PER_PAGE, page: opts.page ?? 1, sort: "-created", expand: "user", filter: filters.join(" && ") },
  });
}

/** Conteo de órdenes por estado (para las pestañas y el menú). */
export async function orderCounts(token: string): Promise<Record<string, number>> {
  const entries = await Promise.all(
    ORDER_STATUSES.map(async (s) => {
      const r = await pb<{ totalItems: number }>("/api/collections/orders/records", { token, query: { perPage: 1, fields: "id", filter: `status = "${s}"` } });
      return [s, r.totalItems] as const;
    }),
  );
  return Object.fromEntries(entries);
}

/** Órdenes que esperan acción del personal: pagadas sin preparar o con el pago por verificar. */
export async function pendingOrderCount(token: string): Promise<number> {
  const r = await pb<{ totalItems: number }>("/api/collections/orders/records", {
    token,
    query: { perPage: 1, fields: "id", filter: 'status = "por_verificar" || status = "pagada"' },
  });
  return r.totalItems;
}

export async function getOrderByNumber(token: string, number: number): Promise<AdminOrder | null> {
  const res = await pb<ListResult<AdminOrder>>("/api/collections/orders/records", { token, query: { perPage: 1, filter: `number = ${number}`, expand: "user" } });
  return res.items[0] ?? null;
}

export async function listOrderEvents(token: string, orderId: string) {
  return (await pb<ListResult<AdminEvent>>("/api/collections/order_events/records", { token, query: { perPage: 100, sort: "created", filter: `order = "${orderId}"`, expand: "author" } })).items;
}

export async function listOrderPayments(token: string, orderId: string) {
  return (await pb<ListResult<AdminPayment>>("/api/collections/payments/records", { token, query: { perPage: 20, sort: "-created", filter: `order = "${orderId}"` } })).items;
}

// ---------- usuarios ----------
export const USERS_PER_PAGE = 25;

export async function listUsers(token: string, opts: { role?: string; search?: string; page?: number } = {}) {
  const filters: string[] = [];
  if (opts.role === "customer" || opts.role === "staff" || opts.role === "admin") filters.push(`role = "${opts.role}"`);
  const q = (opts.search ?? "").trim();
  if (q) filters.push(`(email ~ "${clean(q)}" || name ~ "${clean(q)}" || cedula ~ "${clean(q)}")`);
  return pb<ListResult<UserRecord>>("/api/collections/users/records", {
    token,
    query: { perPage: USERS_PER_PAGE, page: opts.page ?? 1, sort: "-created", filter: filters.join(" && ") },
  });
}

export const getUser = (token: string, id: string) => pb<UserRecord>(`/api/collections/users/records/${id}`, { token });

export async function listUserOrders(token: string, userId: string) {
  return (await pb<ListResult<AdminOrder>>("/api/collections/orders/records", { token, query: { perPage: 50, sort: "-created", filter: `user = "${userId}"` } })).items;
}
