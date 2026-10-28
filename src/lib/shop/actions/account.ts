"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { normalizePhone, str, valuesOf } from "@/lib/admin/validate";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath, type Locale } from "@/lib/i18n";
import { pb, PBError } from "@/lib/pb";
import { SHOP_ENABLED } from "@/lib/site";
import { safeNext } from "../next-url";
import { createCustomer, signIn } from "../auth";
import { clientIp, CUSTOMER_COOKIE, requireCustomer } from "../session";
import type { AccountFormState, Customer } from "../types";
import { checkAccount, checkAddress, checkProfile, normCedula, type ValidationMessages } from "../validate";

type Errors = Record<string, string>;

async function ctx(lang: string) {
  if (!SHOP_ENABLED || !hasLocale(lang)) throw new Error("tienda no disponible");
  const dict = await getDictionary(lang);
  return { lang: lang as Locale, e: dict.account.errors, m: dict.account.messages };
}

/** Valida nombre, teléfono y cédula (comunes a registro y perfil). */
function profileFields(fd: FormData, e: ValidationMessages, errors: Errors) {
  const name = str(fd, "name");
  const phone = normalizePhone(str(fd, "phone"));
  const cedula = normCedula(str(fd, "cedula"));
  Object.assign(errors, checkProfile({ name, phone: str(fd, "phone"), cedula }, e));
  return { name, phone, cedula };
}

export async function loginAction(lang: string, _prev: AccountFormState, fd: FormData): Promise<AccountFormState> {
  const { lang: l, e } = await ctx(lang);
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { message: e.required };
  try {
    await signIn(email, password);
  } catch (err) {
    if (err instanceof PBError && err.status >= 500) return { message: e.generic };
    return { message: e.credentials, values: { email } };
  }
  redirect(safeNext(l, fd.get("next")));
}

export async function registerAction(lang: string, _prev: AccountFormState, fd: FormData): Promise<AccountFormState> {
  const { lang: l, e } = await ctx(lang);
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("passwordConfirm") ?? "");
  const { name, phone, cedula } = profileFields(fd, e, {});
  const errors = checkAccount({ name, email, phone: str(fd, "phone"), cedula, password, passwordConfirm: confirm }, e);
  // Las claves nunca se devuelven al formulario.
  const values = () => {
    const v = valuesOf(fd);
    delete v.password;
    delete v.passwordConfirm;
    return v;
  };
  if (Object.keys(errors).length) return { message: e.fixFields, errors, values: values() };

  const res = await createCustomer({ email, password, passwordConfirm: confirm, name, phone, cedula, lang: l });
  if (!res.ok) {
    if (res.reason === "emailTaken") return { message: e.fixFields, errors: { email: e.emailTaken }, values: values() };
    if (res.reason === "invalid") return { message: e.fixFields, errors: Object.fromEntries((res.fields ?? []).map((k) => [k, e.required])), values: values() };
    return { message: e.generic, values: values() };
  }
  redirect(safeNext(l, fd.get("next")));
}

export async function logoutAction(lang: string) {
  const { lang: l } = await ctx(lang);
  (await cookies()).delete({ name: CUSTOMER_COOKIE, path: "/" });
  redirect(localePath(l, "/cuenta/"));
}

export async function updateProfileAction(lang: string, _prev: AccountFormState, fd: FormData): Promise<AccountFormState> {
  const { lang: l, e, m } = await ctx(lang);
  const { token, user } = await requireCustomer(l);
  const errors: Errors = {};
  const { name, phone, cedula } = profileFields(fd, e, errors);
  if (Object.keys(errors).length) return { message: e.fixFields, errors, values: valuesOf(fd) };
  try {
    await pb<Customer>(`/api/collections/users/records/${user.id}`, { method: "PATCH", token, json: { name, phone, cedula }, ip: await clientIp() });
  } catch {
    return { message: e.generic, values: valuesOf(fd) };
  }
  revalidatePath("/[lang]/cuenta", "layout");
  return { ok: true, message: m.saved };
}

export async function saveAddressAction(lang: string, id: string | undefined, _prev: AccountFormState, fd: FormData): Promise<AccountFormState> {
  const { lang: l, e } = await ctx(lang);
  const { token, user } = await requireCustomer(l);
  const recipient = str(fd, "recipient");
  const phone = normalizePhone(str(fd, "phone"));
  const state = str(fd, "state");
  const city = str(fd, "city");
  const line = str(fd, "line");
  const errors = checkAddress({ label: "", recipient, phone: str(fd, "phone"), state, city, line, reference: "" }, e);
  if (Object.keys(errors).length) return { message: e.fixFields, errors, values: valuesOf(fd) };

  const body = { label: str(fd, "label"), recipient, phone, state, city, line, reference: str(fd, "reference") };
  try {
    await pb(id ? `/api/collections/addresses/records/${id}` : "/api/collections/addresses/records", {
      method: id ? "PATCH" : "POST",
      token,
      json: id ? body : { ...body, user: user.id },
    });
  } catch {
    return { message: e.generic, values: valuesOf(fd) };
  }
  revalidatePath("/[lang]/cuenta", "layout");
  // Si venía del checkout ("next"), vuelve allí; si no, a la libreta de direcciones.
  const back = fd.get("next");
  redirect(typeof back === "string" && back ? safeNext(l, back) : localePath(l, "/cuenta/direcciones/"));
}

export async function deleteAddressAction(lang: string, id: string) {
  const { lang: l } = await ctx(lang);
  const { token } = await requireCustomer(l);
  await pb(`/api/collections/addresses/records/${id}`, { method: "DELETE", token });
  revalidatePath("/[lang]/cuenta", "layout");
  redirect(localePath(l, "/cuenta/direcciones/"));
}
