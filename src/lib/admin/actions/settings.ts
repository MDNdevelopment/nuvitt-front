"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { pb, PBError } from "@/lib/pb";
import { requireAdmin } from "../session";
import type { FormState } from "../types";
import { normalizePhone, num, valuesOf, requireNumber, str, type Errors } from "../validate";

export async function saveSettingsAction(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const { token } = await requireAdmin();
  const errors: Errors = {};
  const override = num(fd, "rate_override");
  const free = num(fd, "free_shipping_usd");
  const rif = str(fd, "merchant_rif").toUpperCase().replace(/[\s-]/g, "");
  const phoneRaw = str(fd, "merchant_phone");
  const phone = phoneRaw ? normalizePhone(phoneRaw) : "";
  const email = str(fd, "admin_email");
  const transfer = str(fd, "transfer_details");
  const zelle = str(fd, "zelle_details");

  requireNumber(errors, "rate_override", override, { min: 0 });
  requireNumber(errors, "free_shipping_usd", free, { min: 0 });
  if (rif && !/^[JGVEPC]\d{7,10}$/.test(rif)) errors.merchant_rif = "Formato esperado: J123456789 (letra y números).";
  if (phoneRaw && !phone) errors.merchant_phone = "Escribe un móvil válido, p. ej. 0424 246 8892.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.admin_email = "El correo no es válido.";
  if (transfer.length > 1000) errors.transfer_details = "Máximo 1000 caracteres.";
  if (zelle.length > 1000) errors.zelle_details = "Máximo 1000 caracteres.";
  if (Object.keys(errors).length) return { message: "Revisa los campos marcados.", errors, values: valuesOf(fd) };

  try {
    await pb(`/api/collections/settings/records/${id}`, {
      token,
      method: "PATCH",
      json: {
        rate_override: override ?? 0,
        free_shipping_usd: free ?? 0,
        merchant_rif: rif,
        merchant_phone: phone,
        admin_email: email,
        transfer_details: transfer,
        zelle_details: zelle,
      },
    });
  } catch (e) {
    if (e instanceof PBError) return { message: e.message, errors: e.fields, values: valuesOf(fd) };
    throw e;
  }
  revalidatePath("/admin/", "layout");
  revalidateTag("catalog", { expire: 0 }); // la tasa vigente se muestra en el sitio público
  return { ok: true, message: "Ajustes guardados." };
}
