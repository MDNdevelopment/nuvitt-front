import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pb } from "@/lib/pb";
import type { AdminUser, Role } from "./types";

export const COOKIE = "nv_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export type Session = { token: string; user: AdminUser };

export const isStaffRole = (r: unknown): r is Role => r === "staff" || r === "admin";

/**
 * Valida el token guardado en la cookie contra PocketBase (auth-refresh) y devuelve
 * el usuario con su rol ACTUAL. Si el token venció o el rol ya no es staff/admin, es null.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await pb<{ record: AdminUser }>("/api/collections/users/auth-refresh", {
      method: "POST",
      token,
    });
    const u = res.record;
    if (!isStaffRole(u.role)) return null;
    return { token, user: { id: u.id, email: u.email, name: u.name ?? "", role: u.role } };
  } catch {
    return null;
  }
});

/** Exige staff o admin. Úsalo en páginas, layouts de datos y en CADA Server Action. */
export async function requireStaff(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login/");
  return session;
}

/** Exige admin (zonas, cupones, ajustes). Un staff vuelve al resumen. */
export async function requireAdmin(): Promise<Session> {
  const session = await requireStaff();
  if (session.user.role !== "admin") redirect("/admin/");
  return session;
}
