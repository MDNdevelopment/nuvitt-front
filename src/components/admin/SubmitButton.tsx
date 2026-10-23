"use client";

import { useFormStatus } from "react-dom";
import { btnPrimary } from "./ui";

export default function SubmitButton({ children, pendingLabel = "Guardando…" }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={btnPrimary}>
      {pending ? pendingLabel : children}
    </button>
  );
}
