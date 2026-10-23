"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pb, PBError } from "@/lib/pb";
import { requireAdmin } from "../session";
import type { FormState } from "../types";
import { bool, num, valuesOf, requireNumber, requireText, str, type Errors } from "../validate";

export async function saveZoneAction(id: string | undefined, _prev: FormState, fd: FormData): Promise<FormState> {
  const { token } = await requireAdmin();
  const errors: Errors = {};
  const kind = str(fd, "kind");
  const courier = kind === "national" ? str(fd, "courier") : "";
  const price = num(fd, "price_usd");
  const sort = num(fd, "sort");

  requireText(errors, "name_es", str(fd, "name_es"));
  requireText(errors, "name_en", str(fd, "name_en"));
  if (kind !== "local" && kind !== "national") errors.kind = "Elige el tipo de zona.";
  requireNumber(errors, "price_usd", price, { min: 0, required: true });
  requireNumber(errors, "sort", sort, { int: true });
  if (Object.keys(errors).length) return { message: "Revisa los campos marcados.", errors, values: valuesOf(fd) };

  const json = {
    name_es: str(fd, "name_es"),
    name_en: str(fd, "name_en"),
    kind,
    courier,
    price_usd: price ?? 0,
    active: bool(fd, "active"),
    sort: sort ?? 0,
  };
  try {
    const saved = await pb<{ id: string }>(id ? `/api/collections/shipping_zones/records/${id}` : "/api/collections/shipping_zones/records", {
      token,
      method: id ? "PATCH" : "POST",
      json,
    });
    revalidatePath("/admin/zonas/");
    if (!id) redirect(`/admin/zonas/${saved.id}/?creada=1`);
  } catch (e) {
    if (e instanceof PBError) return { message: e.message, errors: e.fields, values: valuesOf(fd) };
    throw e;
  }
  return { ok: true, message: "Cambios guardados." };
}

export async function deleteZoneAction(id: string) {
  const { token } = await requireAdmin();
  await pb(`/api/collections/shipping_zones/records/${id}`, { token, method: "DELETE" });
  revalidatePath("/admin/zonas/");
  redirect("/admin/zonas/");
}
