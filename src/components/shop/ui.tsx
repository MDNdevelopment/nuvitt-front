import type { ComponentProps, ReactNode } from "react";

/** Primitivas de formulario del sitio público (mismo aspecto que el formulario de contacto). */
export const fieldClass =
  "w-full rounded-md border border-[#d7dee6] bg-white px-4 py-[11px] text-base text-secondary outline-none transition-colors placeholder:text-[#b5bcc4] focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/15 aria-[invalid=true]:border-[#c62828]";

export function Field({ label, error, hint, htmlFor, children }: { label: string; error?: string; hint?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-[15px] font-medium text-body">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-body">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-xs font-medium text-[#c62828]">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ error, ...props }: ComponentProps<"input"> & { error?: string }) {
  return <input {...props} id={props.id ?? props.name} aria-invalid={!!error} aria-describedby={error ? `${props.id ?? props.name}-error` : undefined} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Flash({ ok, message }: { ok?: boolean; message?: string }) {
  return (
    <div aria-live="polite">
      {message && <p className={`rounded-md px-4 py-3 text-sm font-medium ${ok ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#fdecea] text-[#c62828]"}`}>{message}</p>}
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2.5 rounded bg-primary-dark px-[30px] py-[15px] font-manrope text-base font-medium leading-4 text-white transition-colors hover:bg-primary disabled:cursor-wait disabled:opacity-70";
export const btnGhost =
  "inline-flex items-center justify-center rounded border border-primary-light2 px-5 py-[11px] font-manrope text-[15px] font-semibold leading-4 text-link-blue transition-colors hover:bg-product-bg";
export const card = "rounded-2xl border border-[#dce6f1] bg-white p-6";
