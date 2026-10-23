"use client";

import { useFormStatus } from "react-dom";
import { btnPrimary } from "./ui";

export default function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={btnPrimary}>
      {pending ? pendingLabel : label}
    </button>
  );
}
