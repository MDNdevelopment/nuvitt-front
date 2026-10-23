"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fromDateInput } from "../format";
import { pb, PBError } from "@/lib/pb";
import { requireAdmin } from "../session";
import type { FormState } from "../types";
import { bool, num, valuesOf, requireNumber, requireText, str, type Errors } from "../validate";

export async function saveCouponAction(id: string | undefined, _prev: FormState, fd: FormData): Promise<FormState> {
  const { token } = await requireAdmin();
  const errors: Errors = {};
  const code = str(fd, "code").toUpperCase();
  const kind = str(fd, "kind");
  const value = num(fd, "value");
  const min = num(fd, "min_subtotal_usd");
  const maxUses = num(fd, "max_uses");
  const from = str(fd, "starts_at");
  const to = str(fd, "ends_at");

  requireText(errors, "code", code);
  if (code && !/^[A-Z0-9_-]+$/.test(code)) errors.code = "Solo letras, números, guion y guion bajo.";
  if (kind !== "percent" && kind !== "fixed") errors.kind = "Elige el tipo de descuento.";
  requireNumber(errors, "value", value, { min: 0.01, required: true });
  if (kind === "percent" && value !== null && value > 100) errors.value = "El porcentaje no puede superar 100.";
  requireNumber(errors, "min_subtotal_usd", min, { min: 0 });
  requireNumber(errors, "max_uses", maxUses, { min: 0, int: true });
  if (from && to && from > to) errors.ends_at = "La fecha final es anterior a la inicial.";
  if (Object.keys(errors).length) return { message: "Revisa los campos marcados.", errors, values: valuesOf(fd) };

  const json = {
    code,
    kind,
    value,
    min_subtotal_usd: min ?? 0,
    max_uses: maxUses ?? 0,
    starts_at: fromDateInput(from, "start"),
    ends_at: fromDateInput(to, "end"),
    active: bool(fd, "active"),
  };
  try {
    const saved = await pb<{ id: string }>(id ? `/api/collections/coupons/records/${id}` : "/api/collections/coupons/records", {
      token,
      method: id ? "PATCH" : "POST",
      json,
    });
    revalidatePath("/admin/cupones/");
    if (!id) redirect(`/admin/cupones/${saved.id}/?creado=1`);
  } catch (e) {
    if (e instanceof PBError) return { message: e.message, errors: e.fields, values: valuesOf(fd) };
    throw e;
  }
  return { ok: true, message: "Cambios guardados." };
}

export async function deleteCouponAction(id: string) {
  const { token } = await requireAdmin();
  await pb(`/api/collections/coupons/records/${id}`, { token, method: "DELETE" });
  revalidatePath("/admin/cupones/");
  redirect("/admin/cupones/");
}
