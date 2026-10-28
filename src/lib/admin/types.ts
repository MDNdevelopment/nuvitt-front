import type { ContentLocale, Shared } from "./content";

export type Role = "customer" | "staff" | "admin";

export type AdminUser = { id: string; email: string; name: string; role: Role };

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name_es: string;
  name_en: string;
  summary_es: string;
  summary_en: string;
  categories: string[] | null;
  image: string;
  photos: string[];
  price_usd: number;
  stock: number;
  active: boolean;
  sort: number;
  content_es: Partial<ContentLocale> | null;
  content_en: Partial<ContentLocale> | null;
  shared: Partial<Shared> | null;
};

export type Zone = {
  id: string;
  name_es: string;
  name_en: string;
  kind: "local" | "national";
  courier: "" | "mrw" | "zoom" | "tealca" | "other";
  price_usd: number;
  active: boolean;
  sort: number;
};

export type Coupon = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  value: number;
  min_subtotal_usd: number;
  max_uses: number;
  used: number;
  starts_at: string;
  ends_at: string;
  active: boolean;
};

export type Settings = {
  id: string;
  bcv_rate: number;
  bcv_source: string;
  bcv_updated_at: string;
  rate_override: number;
  free_shipping_usd: number;
  merchant_rif: string;
  merchant_phone: string;
  admin_email: string;
  transfer_details: string;
  zelle_details: string;
};

export type ShopConfig = {
  rate: number;
  rate_updated_at: string;
  free_shipping_usd: number;
  payments_enabled: boolean;
  methods?: { c2p: boolean; transfer: string | null; zelle: string | null };
};

export type ListResult<T> = { page: number; perPage: number; totalItems: number; totalPages: number; items: T[] };

/** Estado que devuelven las Server Actions a los formularios (useActionState). */
export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Valores enviados, para no vaciar el formulario cuando hay errores (React 19 lo reinicia tras cada acción). */
  values?: Record<string, string | string[]>;
  /** Marca de tiempo de un guardado correcto: cambia la `key` de las ranuras de imagen para limpiarlas. */
  saved?: number;
};

export type AdminOrder = {
  id: string;
  number: number;
  status: import("./order-flow").OrderStatus;
  items: { product: string; slug: string; name_es: string; price_usd: number; qty: number }[];
  subtotal_usd: number;
  discount_usd: number;
  shipping_usd: number;
  total_usd: number;
  rate: number;
  total_bs: number;
  zone_name: string;
  address: { recipient?: string; phone?: string; state?: string; city?: string; line?: string; reference?: string } | null;
  coupon_code: string;
  courier: string;
  tracking: string;
  customer_note: string;
  created: string;
  user: string;
  expand?: { user?: UserRecord };
};

export type UserRecord = { id: string; email: string; name: string; phone: string; cedula: string; role: Role; lang: string; created: string };

export type AdminEvent = {
  id: string;
  from_status: string;
  to_status: string;
  note: string;
  public: boolean;
  created: string;
  expand?: { author?: { name: string; email: string } };
};

export type AdminPayment = {
  id: string;
  method: string;
  status: string;
  amount_bs: number;
  amount_usd?: number;
  payer_name?: string;
  bank: string;
  reference: string;
  response_code: string;
  response_message: string;
  created: string;
};
