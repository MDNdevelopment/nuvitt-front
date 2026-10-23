/** Utilidades para leer FormData de los formularios del panel. */

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
export const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

/** Número con coma o punto decimal. Vacío -> null; inválido -> NaN. */
export function num(fd: FormData, key: string): number | null {
  const raw = str(fd, key).replace(",", ".");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : Number.NaN;
}

export type Errors = Record<string, string>;

/** Valores de texto del formulario (sin archivos); las claves repetidas quedan como lista. */
export function valuesOf(fd: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of fd.entries()) {
    if (typeof value !== "string") continue;
    const prev = out[key];
    out[key] = prev === undefined ? value : [...(Array.isArray(prev) ? prev : [prev]), value];
  }
  return out;
}

export function requireText(errors: Errors, key: string, value: string, label = "Este campo") {
  if (!value) errors[key] = `${label} es obligatorio.`;
}

export function requireNumber(errors: Errors, key: string, value: number | null, opts: { min?: number; int?: boolean; required?: boolean } = {}) {
  if (value === null) {
    if (opts.required) errors[key] = "Este campo es obligatorio.";
    return;
  }
  if (Number.isNaN(value)) errors[key] = "Escribe un número válido.";
  else if (opts.min !== undefined && value < opts.min) errors[key] = `Debe ser ${opts.min} o mayor.`;
  else if (opts.int && !Number.isInteger(value)) errors[key] = "Debe ser un número entero.";
}

/** "+58 (424) 246-8892" -> "04242468892"; "" si no es un móvil venezolano válido. */
export function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  d = d.replace(/^0058/, "").replace(/^58/, "").replace(/^0/, "");
  return d.length === 10 && d.startsWith("4") ? `0${d}` : "";
}
