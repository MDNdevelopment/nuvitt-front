"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getOrderByNumber } from "../data";
import { canTransition } from "../order-flow";
import { pb, PBError } from "@/lib/pb";
import { requireStaff } from "../session";
import type { FormState } from "../types";
import { bool, str, valuesOf } from "../validate";

const COURIERS = ["", "mrw", "zoom", "tealca", "other"];

const refresh = (number: number) => {
  revalidatePath("/admin/ordenes/");
  revalidatePath(`/admin/ordenes/${number}/`);
  revalidatePath("/admin/");
};

/** Cambia el estado de una orden (solo transiciones válidas), con nota pública o interna. */
export async function updateOrderAction(number: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const { token } = await requireStaff();
  const order = await getOrderByNumber(token, number);
  if (!order) return { message: "No se encontró la orden." };

  const to = str(fd, "status");
  const note = str(fd, "note").slice(0, 500);
  const reference = str(fd, "reference").slice(0, 40);
  const courier = str(fd, "courier");
  const tracking = str(fd, "tracking").slice(0, 80);
  const fail = (message: string, errors?: Record<string, string>): FormState => ({ message, errors, values: valuesOf(fd) });

  if (!canTransition(order.status, to)) return fail("Ese cambio de estado no está permitido.");
  if (order.status === "por_verificar" && to === "pagada" && !reference) {
    return fail("Indica la referencia del pago que verificaste.", { reference: "La referencia es obligatoria." });
  }
  if (to === "enviada" && courier && !tracking) {
    return fail("Indica el número de guía antes de marcar la orden como enviada.", { tracking: "La guía es obligatoria." });
  }

  const body: Record<string, unknown> = { status: to, _note: note, _public: bool(fd, "public"), _reference: reference };
  if (to === "enviada") {
    if (COURIERS.includes(courier)) body.courier = courier;
    body.tracking = tracking;
  }
  try {
    await pb(`/api/collections/orders/records/${order.id}`, { token, method: "PATCH", json: body });
  } catch (e) {
    if (e instanceof PBError) return fail(e.message);
    throw e;
  }
  refresh(number);
  if (to === "cancelada" || to === "reembolsada") revalidateTag("catalog", { expire: 0 }); // el stock volvió al inventario
  return { ok: true, message: "Estado actualizado." };
}

/** Agrega una nota al historial sin cambiar el estado. */
export async function addOrderNoteAction(number: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const { token, user } = await requireStaff();
  const order = await getOrderByNumber(token, number);
  if (!order) return { message: "No se encontró la orden." };
  const note = str(fd, "note").slice(0, 500);
  if (!note) return { message: "Escribe la nota.", errors: { note: "La nota está vacía." } };
  try {
    await pb("/api/collections/order_events/records", {
      token,
      method: "POST",
      json: { order: order.id, from_status: order.status, to_status: order.status, note, public: bool(fd, "public"), author: user.id },
    });
  } catch (e) {
    if (e instanceof PBError) return { message: e.message, values: valuesOf(fd) };
    throw e;
  }
  refresh(number);
  return { ok: true, message: "Nota agregada." };
}

/** Courier y número de guía (se pueden completar o corregir sin cambiar el estado). */
export async function updateShippingAction(number: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const { token } = await requireStaff();
  const order = await getOrderByNumber(token, number);
  if (!order) return { message: "No se encontró la orden." };
  const courier = str(fd, "courier");
  const tracking = str(fd, "tracking").slice(0, 80);
  if (!COURIERS.includes(courier)) return { message: "Courier no válido." };
  if (order.status === "enviada" && courier && !tracking) return { message: "Una orden enviada con courier necesita su número de guía.", errors: { tracking: "La guía es obligatoria." }, values: valuesOf(fd) };
  try {
    await pb(`/api/collections/orders/records/${order.id}`, { token, method: "PATCH", json: { courier, tracking } });
  } catch (e) {
    if (e instanceof PBError) return { message: e.message, values: valuesOf(fd) };
    throw e;
  }
  refresh(number);
  return { ok: true, message: "Envío actualizado." };
}
