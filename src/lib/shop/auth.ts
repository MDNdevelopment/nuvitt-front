import "server-only";
import { pb, PBError } from "@/lib/pb";
import { clientIp, setCustomerCookie } from "./session";

/** Inicia sesión en PocketBase y deja la cookie de cliente. Devuelve el token y el id para seguir en la misma petición. */
export async function signIn(email: string, password: string): Promise<{ token: string; userId: string }> {
  const res = await pb<{ token: string; record: { id: string } }>("/api/collections/users/auth-with-password", {
    method: "POST",
    json: { identity: email, password },
    ip: await clientIp(),
  });
  await setCustomerCookie(res.token);
  return { token: res.token, userId: res.record.id };
}

export type CreateCustomerResult =
  | { ok: true; token: string; userId: string }
  | { ok: false; reason: "emailTaken" | "invalid" | "generic"; fields?: string[] };

/** Crea la cuenta de un cliente y deja la sesión iniciada. Los datos ya vienen validados. */
export async function createCustomer(v: {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone: string;
  cedula: string;
  lang: string;
}): Promise<CreateCustomerResult> {
  try {
    await pb("/api/collections/users/records", { method: "POST", json: v, ip: await clientIp() });
  } catch (err) {
    if (err instanceof PBError) {
      if (err.fields.email) return { ok: false, reason: "emailTaken" };
      if (err.status < 500) return { ok: false, reason: "invalid", fields: Object.keys(err.fields) };
    }
    return { ok: false, reason: "generic" };
  }
  try {
    return { ok: true, ...(await signIn(v.email, v.password)) };
  } catch {
    return { ok: false, reason: "generic" };
  }
}
