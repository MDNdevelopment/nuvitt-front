import type { Locale } from "@/lib/i18n";

export type Customer = {
  id: string;
  email: string;
  name: string;
  phone: string;
  cedula: string;
  lang: Locale;
  role: string;
};

export type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  state: string;
  city: string;
  line: string;
  reference: string;
};

export type OrderItem = { product: string; slug: string; name_es: string; name_en: string; price_usd: number; qty: number };

export type OrderStatusKey =
  | "pendiente_pago"
  | "por_verificar"
  | "pagada"
  | "en_preparacion"
  | "enviada"
  | "entregada"
  | "cancelada"
  | "reembolsada";

export type Order = {
  id: string;
  number: number;
  status: OrderStatusKey;
  items: OrderItem[];
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
  created: string;
};

export type OrderEvent = { id: string; from_status: string; to_status: string; note: string; created: string };

export type Payment = { id: string; method: string; status: string; amount_bs: number; reference: string; created: string };

export type AccountFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string | string[]>;
};
