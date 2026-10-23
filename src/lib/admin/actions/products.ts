"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  alignPairs,
  DEFAULT_THEME,
  MEDIA_SLOTS,
  missingForActivation,
  normalizeContent,
  normalizeIcons,
  normalizeTheme,
  withDefaults,
  type MediaEntry,
  type MediaSlot,
  type Shared,
} from "../content";
import { getProduct } from "../data";
import { slugify } from "../format";
import { imageSize } from "../image-size";
import { pb, PBError } from "@/lib/pb";
import { requireAdmin, requireStaff } from "../session";
import type { FormState, Product } from "../types";
import { bool, num, requireNumber, requireText, str, type Errors } from "../validate";

const MAX_PHOTO = 5 * 1024 * 1024;
const LEGACY = /^[\w.-]+\.(webp|png|jpe?g)$/i;

const json = (fd: FormData, key: string): unknown => {
  try {
    return JSON.parse(String(fd.get(key) ?? "null"));
  } catch {
    return null;
  }
};

const refreshPublicSite = () => {
  revalidatePath("/admin/productos/");
  revalidateTag("catalog", { expire: 0 }); // precios, stock y fichas del sitio público
};

export async function saveProductAction(id: string | undefined, _prev: FormState, fd: FormData): Promise<FormState> {
  const { token } = await requireStaff();

  // --- datos básicos ---
  const errors: Errors = {};
  const nameEs = str(fd, "name_es");
  const nameEn = str(fd, "name_en");
  const sku = str(fd, "sku").toUpperCase();
  const price = num(fd, "price_usd");
  const stock = num(fd, "stock");
  const sort = num(fd, "sort");
  const active = bool(fd, "active");
  const slug = id ? undefined : str(fd, "slug") || slugify(nameEs);

  requireText(errors, "name_es", nameEs);
  requireText(errors, "name_en", nameEn);
  requireText(errors, "sku", sku);
  if (!id) requireText(errors, "slug", slug ?? "");
  requireNumber(errors, "price_usd", price, { min: 0, required: true });
  requireNumber(errors, "stock", stock, { min: 0, int: true });
  requireNumber(errors, "sort", sort, { int: true });

  const current: Product | null = id ? await getProduct(token, id) : null;

  // --- ficha ---
  const rawEs = normalizeContent(json(fd, "content_es"));
  const rawEn = normalizeContent(json(fd, "content_en"));
  const others = await listOtherSlugs(token, id);
  const aligned = alignPairs(rawEs, rawEn, normalizeIcons(json(fd, "shared_icons"), 8), others, current?.slug ?? slug ?? "");
  const theme = normalizeTheme(json(fd, "theme"));

  // --- imágenes: se parte de lo guardado en el servidor, nunca de lo que diga el navegador ---
  const media: Partial<Record<MediaSlot, MediaEntry>> = { ...(current?.shared?.media ?? {}) };
  const uploads: { slot: MediaSlot; file: File; w: number; h: number }[] = [];
  for (const slot of MEDIA_SLOTS) {
    if (bool(fd, `rm_${slot}`) && (slot === "label_es" || slot === "label_en")) delete media[slot];
    const f = fd.get(`img_${slot}`);
    if (!(f instanceof File) || f.size === 0) continue;
    if (f.size > MAX_PHOTO) errors[`img_${slot}`] = "Cada foto debe pesar máximo 5 MB.";
    else if (!/^image\/(jpeg|png|webp)$/.test(f.type)) errors[`img_${slot}`] = "Solo se aceptan fotos JPG, PNG o WebP.";
    else {
      const dims = imageSize(new Uint8Array(await f.arrayBuffer()));
      if (!dims) errors[`img_${slot}`] = "No se pudo leer la imagen.";
      else uploads.push({ slot, file: f, w: dims.width, h: dims.height });
    }
  }
  for (const slot of MEDIA_SLOTS) {
    const ref = media[slot]?.ref ?? "";
    if (ref.startsWith("legacy:") && !LEGACY.test(ref.slice(7))) delete media[slot];
  }
  const finalMedia = { ...media, ...Object.fromEntries(uploads.map((u) => [u.slot, { ref: "pb:pending", w: u.w, h: u.h }])) };

  if (active) {
    const missing = missingForActivation({ price, media: finalMedia, es: aligned.es, en: aligned.en });
    if (missing.length) {
      return { message: `Para activar el producto falta: ${missing.map((m) => m.label).join(", ")}.`, errors };
    }
  }
  if (Object.keys(errors).length) return { message: "Revisa los campos marcados.", errors };

  // Los archivos que se reemplazan o quitan se borran de PocketBase.
  const drop = MEDIA_SLOTS.flatMap((slot) => {
    const old = current?.shared?.media?.[slot]?.ref ?? "";
    const replaced = uploads.some((u) => u.slot === slot) || !media[slot];
    return old.startsWith("pb:") && replaced ? [old.slice(3)] : [];
  });

  // Paso 1: datos básicos y archivos. Nunca toca "active": se fija al final, con la ficha ya guardada.
  const body = new FormData();
  if (slug) body.set("slug", slug);
  body.set("sku", sku);
  body.set("name_es", nameEs);
  body.set("name_en", nameEn);
  body.set("categories", JSON.stringify(fd.getAll("categories").map(String)));
  body.set("price_usd", String(price ?? 0));
  body.set("stock", String(stock ?? 0));
  body.set("sort", String(sort ?? 0));
  for (const u of uploads) body.append("photos+", u.file);
  for (const name of drop) body.append("photos-", name);

  let saved: Product;
  try {
    saved = await pb<Product>(id ? `/api/collections/products/records/${id}` : "/api/collections/products/records", {
      token,
      method: id ? "PATCH" : "POST",
      form: body,
    });
    // PocketBase añade los archivos nuevos al final, en el orden en que se enviaron.
    const added = uploads.length ? saved.photos.slice(-uploads.length) : [];
    uploads.forEach((u, i) => {
      media[u.slot] = { ref: `pb:${added[i]}`, w: u.w, h: u.h };
    });

    // Paso 2: ficha, imágenes, íconos, colores y estado.
    const shared: Shared = { media, icons: aligned.icons, theme: theme ?? DEFAULT_THEME };
    await pb(`/api/collections/products/records/${saved.id}`, {
      token,
      method: "PATCH",
      json: { content_es: aligned.es, content_en: aligned.en, shared, active },
    });
  } catch (e) {
    if (e instanceof PBError) return { message: e.fields.slug || e.fields.sku ? "Revisa los campos marcados." : e.message, errors: e.fields };
    throw e;
  }

  refreshPublicSite();
  if (!id) redirect(`/admin/productos/${saved.id}/?creado=1`);
  return { ok: true, message: "Cambios guardados.", saved: Date.now() };
}

/** Slugs de los demás productos (para validar los relacionados). */
async function listOtherSlugs(token: string, selfId?: string): Promise<Set<string>> {
  const res = await pb<{ items: { id: string; slug: string }[] }>("/api/collections/products/records", {
    token,
    query: { perPage: 200, fields: "id,slug" },
  });
  return new Set(res.items.filter((p) => p.id !== selfId).map((p) => p.slug));
}

export async function toggleProductAction(id: string, formData: FormData) {
  const { token } = await requireStaff();
  const next = formData.get("next") === "true";
  if (next) {
    const p = await getProduct(token, id);
    const missing = missingForActivation({
      price: p.price_usd,
      media: p.shared?.media ?? {},
      es: withDefaults(p.content_es),
      en: withDefaults(p.content_en),
    });
    if (missing.length) redirect(`/admin/productos/${id}/?incompleto=1`);
  }
  await pb(`/api/collections/products/records/${id}`, { token, method: "PATCH", json: { active: next } });
  refreshPublicSite();
}

export async function deleteProductAction(id: string) {
  const { token } = await requireAdmin();
  await pb(`/api/collections/products/records/${id}`, { token, method: "DELETE" });
  refreshPublicSite();
  redirect("/admin/productos/");
}
