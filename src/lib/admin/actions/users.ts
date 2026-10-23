"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { COOKIE, COOKIE_MAX_AGE, requireAdmin, requireStaff } from "../session";
import { pb, PBError } from "@/lib/pb";
import type { FormState, Role } from "../types";
import { normalizePhone, str, valuesOf, type Errors } from "../validate";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CEDULA = /^[VEJGP]\d{5,10}$/;
const ROLES: Role[] = ["customer", "staff", "admin"];
const normCedula = (s: string) => s.toUpperCase().replace(/[\s.-]/g, "");

function profile(fd: FormData, errors: Errors) {
  const name = str(fd, "name");
  const phoneRaw = str(fd, "phone");
  const phone = phoneRaw ? normalizePhone(phoneRaw) : "";
  const cedula = normCedula(str(fd, "cedula"));
  if (name.length < 2) errors.name = "Escribe el nombre.";
  if (phoneRaw && !phone) errors.phone = "Escribe un móvil válido, p. ej. 0412 123 4567.";
  if (cedula && !CEDULA.test(cedula)) errors.cedula = "Formato esperado: V12345678.";
  return { name, phone, cedula };
}

/** Crea una cuenta del panel (staff o admin). PocketBase no deja fijar el rol al crear, así que se asigna después. */
export async function createUserAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { token } = await requireAdmin();
  const errors: Errors = {};
  const email = str(fd, "email");
  const role = str(fd, "role") as Role;
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("passwordConfirm") ?? "");
  const { name, phone, cedula } = profile(fd, errors);
  if (!EMAIL.test(email)) errors.email = "Escribe un correo válido.";
  if (role !== "staff" && role !== "admin") errors.role = "Elige el rol.";
  if (password.length < 8) errors.password = "Mínimo 8 caracteres.";
  else if (password !== confirm) errors.passwordConfirm = "Las claves no coinciden.";
  const values = () => {
    const v = valuesOf(fd);
    delete v.password;
    delete v.passwordConfirm;
    return v;
  };
  if (Object.keys(errors).length) return { message: "Revisa los campos marcados.", errors, values: values() };

  let id = "";
  try {
    const created = await pb<{ id: string }>("/api/collections/users/records", {
      token,
      method: "POST",
      json: { email, password, passwordConfirm: confirm, name, phone, cedula, lang: "es" },
    });
    id = created.id;
    await pb(`/api/collections/users/records/${id}`, { token, method: "PATCH", json: { role } });
  } catch (e) {
    if (e instanceof PBError) {
      if (id) return { message: "La cuenta se creó pero no se pudo asignar el rol. Ábrela desde la lista de usuarios y corrígelo.", values: values() };
      return { message: e.fields.email ? "Revisa los campos marcados." : e.message, errors: e.fields.email ? { email: "Ya existe una cuenta con este correo." } : e.fields, values: values() };
    }
    throw e;
  }
  revalidatePath("/admin/usuarios/");
  redirect(`/admin/usuarios/${id}/?creado=1`);
}

/** Edita datos y rol de un usuario. Un admin no puede cambiar su propio rol (así nunca se queda sin admins). */
export async function updateUserAction(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const { token, user } = await requireAdmin();
  const errors: Errors = {};
  const role = str(fd, "role") as Role;
  const { name, phone, cedula } = profile(fd, errors);
  if (!ROLES.includes(role)) errors.role = "Rol no válido.";
  if (id === user.id && role !== user.role) errors.role = "No puedes cambiar tu propio rol.";
  if (Object.keys(errors).length) return { message: "Revisa los campos marcados.", errors, values: valuesOf(fd) };
  try {
    await pb(`/api/collections/users/records/${id}`, { token, method: "PATCH", json: { name, phone, cedula, role } });
  } catch (e) {
    if (e instanceof PBError) return { message: e.message, errors: e.fields, values: valuesOf(fd) };
    throw e;
  }
  revalidatePath("/admin/usuarios/");
  revalidatePath(`/admin/usuarios/${id}/`);
  return { ok: true, message: "Cambios guardados." };
}

/** Cambia la clave del usuario en sesión. PocketBase invalida el token al cambiarla: se vuelve a iniciar sesión. */
export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { token, user } = await requireStaff();
  const oldPassword = String(fd.get("oldPassword") ?? "");
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("passwordConfirm") ?? "");
  const errors: Errors = {};
  if (!oldPassword) errors.oldPassword = "Escribe tu clave actual.";
  if (password.length < 8) errors.password = "Mínimo 8 caracteres.";
  else if (password === oldPassword) errors.password = "La clave nueva debe ser distinta de la actual.";
  else if (password !== confirm) errors.passwordConfirm = "Las claves no coinciden.";
  if (Object.keys(errors).length) return { message: "Revisa los campos marcados.", errors };

  try {
    await pb(`/api/collections/users/records/${user.id}`, { token, method: "PATCH", json: { oldPassword, password, passwordConfirm: confirm } });
    const res = await pb<{ token: string }>("/api/collections/users/auth-with-password", { method: "POST", json: { identity: user.email, password } });
    (await cookies()).set(COOKIE, res.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/admin", maxAge: COOKIE_MAX_AGE });
  } catch (e) {
    if (e instanceof PBError) {
      if (e.fields.oldPassword) return { message: "Revisa los campos marcados.", errors: { oldPassword: "La clave actual no es correcta." } };
      return { message: e.message, errors: e.fields };
    }
    throw e;
  }
  return { ok: true, message: "Clave actualizada." };
}

export async function updateOwnNameAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { token, user } = await requireStaff();
  const name = str(fd, "name");
  if (name.length < 2) return { message: "Escribe tu nombre.", errors: { name: "Escribe tu nombre." }, values: valuesOf(fd) };
  try {
    await pb(`/api/collections/users/records/${user.id}`, { token, method: "PATCH", json: { name } });
  } catch (e) {
    if (e instanceof PBError) return { message: e.message };
    throw e;
  }
  revalidatePath("/admin/", "layout");
  return { ok: true, message: "Nombre actualizado." };
}
