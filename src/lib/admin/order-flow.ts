export type OrderStatus =
  | "pendiente_pago"
  | "por_verificar"
  | "pagada"
  | "en_preparacion"
  | "enviada"
  | "entregada"
  | "cancelada"
  | "reembolsada";

export const ORDER_STATUSES: OrderStatus[] = [
  "pendiente_pago",
  "por_verificar",
  "pagada",
  "en_preparacion",
  "enviada",
  "entregada",
  "cancelada",
  "reembolsada",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente_pago: "Pendiente de pago",
  por_verificar: "Por verificar",
  pagada: "Pagada",
  en_preparacion: "En preparación",
  enviada: "Enviada",
  entregada: "Entregada",
  cancelada: "Cancelada",
  reembolsada: "Reembolsada",
};

export const STATUS_TONE: Record<OrderStatus, "green" | "red" | "amber" | "gray" | "blue"> = {
  pendiente_pago: "amber",
  por_verificar: "amber",
  pagada: "blue",
  en_preparacion: "blue",
  enviada: "blue",
  entregada: "green",
  cancelada: "red",
  reembolsada: "gray",
};

/** Mismas transiciones que valida el backend (internal/shop/transitions.go). */
const TRANSITIONS: Record<string, OrderStatus[]> = {
  pendiente_pago: ["cancelada"],
  por_verificar: ["pagada", "cancelada"],
  pagada: ["en_preparacion", "cancelada", "reembolsada"],
  en_preparacion: ["enviada", "cancelada", "reembolsada"],
  enviada: ["entregada", "reembolsada"],
  entregada: ["reembolsada"],
};

export const nextStatuses = (from: string): OrderStatus[] => TRANSITIONS[from] ?? [];
export const canTransition = (from: string, to: string) => nextStatuses(from).includes(to as OrderStatus);

export const METHOD_LABEL: Record<string, string> = {
  c2p: "Pago móvil C2P",
  p2p: "Pago móvil P2P",
  transfer: "Transferencia / Pago móvil",
  zelle: "Zelle",
};

export const PAYMENT_LABEL: Record<string, string> = {
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  por_verificar: "Por verificar",
  reversado: "Reversado",
};
