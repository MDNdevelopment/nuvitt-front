"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/admin/actions/auth";
import type { FormState } from "@/lib/admin/types";
import SubmitButton from "@/components/admin/SubmitButton";
import { Field, Flash, Input } from "@/components/admin/ui";

export default function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <Field label="Correo" htmlFor="email">
        <Input name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Clave" htmlFor="password">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Flash message={state.message} />
      <div className="pt-1">
        <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
      </div>
    </form>
  );
}
