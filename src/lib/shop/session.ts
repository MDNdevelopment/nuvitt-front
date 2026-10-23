import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { localePath, type Locale } from "@/lib/i18n";
import { pb } from "@/lib/pb";
import type { Customer } from "./types";

export const CUSTOMER_COOKIE = "nv_session";
export const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 14;

export type CustomerSession = { token: string; user: Customer };

/** IP real del visitante (Netlify o proxy), para que PocketBase aplique su rate limit por persona. */
export async function clientIp(): Promise<string | undefined> {
  const h = await headers();
  return h.get("x-nf-client-connection-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
}

/** Valida el token de la cookie con PocketBase (auth-refresh) y devuelve el cliente con datos vigentes. */
export const getCustomer = cache(async (): Promise<CustomerSession | null> => {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await pb<{ record: Customer }>("/api/collections/users/auth-refresh", { method: "POST", token });
    const u = res.record;
    return {
      token,
      user: { id: u.id, email: u.email, name: u.name ?? "", phone: u.phone ?? "", cedula: u.cedula ?? "", lang: u.lang ?? "es", role: u.role },
    };
  } catch {
    return null;
  }
});

/** Exige sesión de cliente; sin ella manda a /cuenta/ (donde está el login). Úsalo también en cada Server Action. */
export async function requireCustomer(lang: Locale): Promise<CustomerSession> {
  const session = await getCustomer();
  if (!session) redirect(localePath(lang, "/cuenta/"));
  return session;
}

export async function setCustomerCookie(token: string) {
  (await cookies()).set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_MAX_AGE,
  });
}
