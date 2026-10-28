import { normalizePhone } from "@/lib/admin/validate";

/** Validaciones de cuenta, dirección y pago. Sin dependencias de servidor: las usan el checkout (cliente) y las Server Actions. */

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CEDULA = /^[VEJGP]\d{5,10}$/;
export const normCedula = (s: string) => s.toUpperCase().replace(/[\s.-]/g, "");

export type FieldErrors = Record<string, string>;
/** Mensajes de `dict.account.errors` que usan estas validaciones. */
export type ValidationMessages = { required: string; email: string; phone: string; cedula: string; passwordShort: string; passwordMismatch: string; emailTaken: string };

export type AccountInput = { name: string; email: string; phone: string; cedula: string; password: string; passwordConfirm: string };
export type AddressInput = { label: string; recipient: string; phone: string; state: string; city: string; line: string; reference: string };

export const emptyAddress: AddressInput = { label: "", recipient: "", phone: "", state: "", city: "", line: "", reference: "" };

/** Nombre, teléfono y cédula (comunes a registro y perfil). */
export function checkProfile(v: Pick<AccountInput, "name" | "phone" | "cedula">, e: ValidationMessages): FieldErrors {
  const errors: FieldErrors = {};
  if (v.name.trim().length < 2) errors.name = e.required;
  if (!normalizePhone(v.phone)) errors.phone = e.phone;
  if (!CEDULA.test(normCedula(v.cedula))) errors.cedula = e.cedula;
  return errors;
}

export function checkAccount(v: AccountInput, e: ValidationMessages): FieldErrors {
  const errors = checkProfile(v, e);
  if (!EMAIL.test(v.email.trim())) errors.email = e.email;
  if (v.password.length < 8) errors.password = e.passwordShort;
  else if (v.password !== v.passwordConfirm) errors.passwordConfirm = e.passwordMismatch;
  return errors;
}

export function checkAddress(v: AddressInput, e: ValidationMessages): FieldErrors {
  const errors: FieldErrors = {};
  if (v.recipient.trim().length < 2) errors.recipient = e.required;
  if (!normalizePhone(v.phone)) errors.phone = e.phone;
  if (!v.state.trim()) errors.state = e.required;
  if (!v.city.trim()) errors.city = e.required;
  if (v.line.trim().length < 5) errors.line = e.required;
  return errors;
}

export type PaymentInput =
  | { method: "c2p"; bank: string; id: string; phone: string; token: string }
  | { method: "transfer"; bank: string; reference: string }
  | { method: "zelle"; reference: string; payerName: string };

/** Mismas reglas que el backend (internal/shop/routes.go). */
export function paymentOk(p: PaymentInput): boolean {
  switch (p.method) {
    case "c2p":
      return /^\d{4}$/.test(p.bank) && /^[VEJGP]\d{5,10}$/.test(normCedula(p.id)) && !!normalizePhone(p.phone) && /^\d{8,12}$/.test(p.token);
    case "transfer":
      return /^\d{4}$/.test(p.bank) && /^\d{6,20}$/.test(p.reference.trim());
    case "zelle":
      return p.reference.trim().length >= 4 && p.reference.trim().length <= 40 && p.payerName.trim().length >= 2 && p.payerName.trim().length <= 80;
  }
}
