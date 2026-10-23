import type { ComponentProps, ReactNode } from "react";

/** Primitivas de formulario del panel (mismos estilos que el formulario de contacto). */
export const fieldClass =
  "w-full rounded-md border border-[#d7dee6] bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-[#b5bcc4] focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/15 disabled:bg-[#f1f4f7] disabled:text-slate aria-[invalid=true]:border-[#c62828]";

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-[#c62828]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ error, ...props }: ComponentProps<"input"> & { error?: string }) {
  return <input {...props} id={props.id ?? props.name} aria-invalid={!!error} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Textarea({ error, ...props }: ComponentProps<"textarea"> & { error?: string }) {
  return <textarea rows={3} {...props} id={props.id ?? props.name} aria-invalid={!!error} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Select({ error, children, ...props }: ComponentProps<"select"> & { error?: string }) {
  return (
    <select {...props} id={props.id ?? props.name} aria-invalid={!!error} className={`${fieldClass} ${props.className ?? ""}`}>
      {children}
    </select>
  );
}

export function Checkbox({ label, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
      <input type="checkbox" {...props} className="size-4 rounded border-[#b9c4cf] accent-primary-dark" />
      {label}
    </label>
  );
}

export function Flash({ ok, message }: { ok?: boolean; message?: string }) {
  return (
    <div aria-live="polite">
      {message && (
        <p
          className={`rounded-md px-3.5 py-2.5 text-sm font-medium ${
            ok ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#fdecea] text-[#c62828]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export function Badge({ tone = "gray", children }: { tone?: "green" | "red" | "amber" | "gray" | "blue"; children: ReactNode }) {
  const tones = {
    green: "bg-[#e8f5e9] text-[#2e7d32]",
    red: "bg-[#fdecea] text-[#c62828]",
    amber: "bg-[#fff4e0] text-[#a96400]",
    gray: "bg-[#eef1f4] text-slate",
    blue: "bg-product-bg text-heading-dark",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-[#e1e8ee] bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-raleway text-2xl font-bold text-heading-dark">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded bg-primary-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-wait disabled:opacity-70";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded border border-[#d7dee6] bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary-dark hover:text-primary-dark disabled:opacity-60";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded border border-[#f0c4c0] bg-white px-4 py-2 text-sm font-semibold text-[#c62828] transition-colors hover:bg-[#fdecea]";

export const table = {
  wrap: "overflow-x-auto rounded-lg border border-[#e1e8ee] bg-white shadow-sm",
  table: "w-full min-w-[640px] border-collapse text-left text-sm",
  th: "border-b border-[#e1e8ee] bg-[#f7f9fb] px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate",
  td: "border-b border-[#eef1f4] px-4 py-3 align-middle text-ink",
};
