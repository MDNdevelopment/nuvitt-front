const usd = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const bs = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUsd = (n: number) => usd.format(n || 0);
export const formatBs = (n: number) => `Bs ${bs.format(n || 0)}`;

export function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Caracas" }).format(d);
}

/** Fecha de PocketBase (UTC) -> "AAAA-MM-DD" en hora de Caracas, para <input type="date">. */
export function toDateInput(value: string): string {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Caracas" }).format(d);
}

/** "AAAA-MM-DD" (Caracas, UTC-4) -> instante UTC para PocketBase. start: 00:00; end: 23:59:59. */
export function fromDateInput(date: string, edge: "start" | "end"): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  return edge === "start" ? `${date} 04:00:00.000Z` : new Date(`${date}T23:59:59-04:00`).toISOString().replace("T", " ");
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
