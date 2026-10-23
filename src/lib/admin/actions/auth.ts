"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pb, PBError } from "@/lib/pb";
import { COOKIE, COOKIE_MAX_AGE, isStaffRole } from "../session";
import type { AdminUser, FormState } from "../types";

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { message: "Escribe tu correo y tu clave." };

  let token: string;
  try {
    const res = await pb<{ token: string; record: AdminUser }>("/api/collections/users/auth-with-password", {
      method: "POST",
      json: { identity: email, password },
    });
    if (!isStaffRole(res.record.role)) {
      return { message: "Esta cuenta no tiene acceso al panel." };
    }
    token = res.token;
  } catch (e) {
    if (e instanceof PBError && e.status >= 500) return { message: e.message };
    return { message: "Correo o clave incorrectos." };
  }

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: COOKIE_MAX_AGE,
  });
  redirect("/admin/");
}

export async function logoutAction() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
  redirect("/admin/login/");
}
