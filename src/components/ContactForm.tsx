"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRightSolidIcon, SelectCaretIcon } from "./icons";
import { FORMSUBMIT_ENDPOINT } from "@/lib/site";

type Props = {
  labels: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    type: string;
    types: string[];
    message: string;
    messagePlaceholder: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
    subject: string;
  };
};

type Status = "idle" | "sending" | "success" | "error";

const fieldClass =
  "w-full rounded-md border border-[#d7dee6] bg-white px-4 py-[11px] text-base text-secondary outline-none transition-colors placeholder:text-[#b5bcc4] focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/15";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2.5 block text-[15px] font-medium leading-[15px] text-body">
        {label} <span className="text-[#d9534f]">*</span>
      </label>
      {children}
    </div>
  );
}

export default function ContactForm({ labels }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Campo trampa anti-spam: si un bot lo rellena, se descarta en silencio.
    if (data.get("_honey")) return;

    setStatus("sending");
    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          tipo: data.get("type"),
          mensaje: data.get("message"),
          _subject: labels.subject,
          _template: "table",
          _captcha: "false",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === "false" || result.success === false) {
        throw new Error("formsubmit");
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={labels.name} htmlFor="cf-name">
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder={labels.namePlaceholder}
            className={fieldClass}
          />
        </Field>
        <Field label={labels.email} htmlFor="cf-email">
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={labels.emailPlaceholder}
            className={fieldClass}
          />
        </Field>
      </div>

      <Field label={labels.type} htmlFor="cf-type">
        <div className="relative">
          <select
            id="cf-type"
            name="type"
            required
            defaultValue={labels.types[0]}
            className={`${fieldClass} appearance-none pr-10`}
          >
            {labels.types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <SelectCaretIcon className="pointer-events-none absolute right-4 top-1/2 size-3 -translate-y-1/2 text-[#8a949e]" />
        </div>
      </Field>

      <Field label={labels.message} htmlFor="cf-message">
        <textarea
          id="cf-message"
          name="message"
          required
          rows={3}
          placeholder={labels.messagePlaceholder}
          className={`${fieldClass} resize-y`}
        />
      </Field>

      {/* Honeypot: oculto a personas y lectores de pantalla. */}
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2.5 rounded bg-primary-dark px-[30px] py-[17px] font-manrope text-base font-medium leading-4 text-white transition-colors hover:bg-primary disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? labels.sending : labels.submit}
          {!sending && <ArrowRightSolidIcon className="size-4" />}
        </button>
      </div>

      <div aria-live="polite" className="min-h-6 text-[15px]">
        {status === "success" && <p className="text-[#2e7d32]">{labels.success}</p>}
        {status === "error" && <p className="text-[#c62828]">{labels.error}</p>}
      </div>
    </form>
  );
}
