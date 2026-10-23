"use client";

import { useActionState } from "react";
import { changePasswordAction, createUserAction, updateOwnNameAction, updateUserAction } from "@/lib/admin/actions/users";
import type { FormState, Role, UserRecord } from "@/lib/admin/types";
import SubmitButton from "./SubmitButton";
import { Card, Field, Flash, Input, Select } from "./ui";

const none: FormState = {};
const useVal = (s: FormState) => (k: string, d: string | number | undefined = "") => String(s.values?.[k] ?? d ?? "");

const ROLE_LABEL: Record<Role, string> = { customer: "Cliente", staff: "Staff (órdenes y productos)", admin: "Administrador (todo)" };

export function CreateUserForm() {
  const [state, action] = useActionState(createUserAction, none);
  const v = useVal(state);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5">
      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="name" error={e.name}>
          <Input name="name" defaultValue={v("name")} required error={e.name} />
        </Field>
        <Field label="Correo" htmlFor="email" error={e.email}>
          <Input name="email" type="email" defaultValue={v("email")} required error={e.email} />
        </Field>
        <Field label="Rol" htmlFor="role" error={e.role}>
          <Select name="role" defaultValue={v("role", "staff")} error={e.role}>
            <option value="staff">{ROLE_LABEL.staff}</option>
            <option value="admin">{ROLE_LABEL.admin}</option>
          </Select>
        </Field>
        <Field label="Teléfono (opcional)" htmlFor="phone" error={e.phone}>
          <Input name="phone" type="tel" defaultValue={v("phone")} error={e.phone} />
        </Field>
        <Field label="Clave inicial" htmlFor="password" error={e.password} hint="Mínimo 8 caracteres. La persona puede cambiarla en «Mi perfil».">
          <Input name="password" type="password" autoComplete="new-password" required error={e.password} />
        </Field>
        <Field label="Repite la clave" htmlFor="passwordConfirm" error={e.passwordConfirm}>
          <Input name="passwordConfirm" type="password" autoComplete="new-password" required error={e.passwordConfirm} />
        </Field>
      </Card>
      <Flash ok={state.ok} message={state.message} />
      <SubmitButton>Crear usuario</SubmitButton>
    </form>
  );
}

export function EditUserForm({ user, self }: { user: UserRecord; self: boolean }) {
  const [state, action] = useActionState(updateUserAction.bind(null, user.id), none);
  const v = useVal(state);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5">
      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="Correo" htmlFor="email-ro">
          <Input id="email-ro" value={user.email} disabled readOnly />
        </Field>
        <Field label="Nombre" htmlFor="name" error={e.name}>
          <Input name="name" defaultValue={v("name", user.name)} required error={e.name} />
        </Field>
        <Field label="Teléfono" htmlFor="phone" error={e.phone}>
          <Input name="phone" type="tel" defaultValue={v("phone", user.phone)} error={e.phone} />
        </Field>
        <Field label="Cédula / RIF" htmlFor="cedula" error={e.cedula}>
          <Input name="cedula" defaultValue={v("cedula", user.cedula)} error={e.cedula} />
        </Field>
        <Field label="Rol" htmlFor="role" error={e.role} hint={self ? "No puedes cambiar tu propio rol." : undefined}>
          {self ? <input type="hidden" name="role" value={user.role} /> : null}
          <Select name={self ? undefined : "role"} defaultValue={v("role", user.role)} disabled={self} error={e.role}>
            {(["customer", "staff", "admin"] as const).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </Select>
        </Field>
      </Card>
      <Flash ok={state.ok} message={state.message} />
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}

export function OwnProfileForms({ name, email, role }: { name: string; email: string; role: Role }) {
  const [ns, nameAction] = useActionState(updateOwnNameAction, none);
  const [ps, passAction] = useActionState(changePasswordAction, none);
  const nv = useVal(ns);
  const pe = ps.errors ?? {};
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Mis datos</h2>
        <p className="mb-3 text-sm text-slate">
          {email} · {role === "admin" ? "Administrador" : "Staff"}
        </p>
        <form action={nameAction} className="space-y-3">
          <Field label="Nombre" htmlFor="name" error={ns.errors?.name}>
            <Input name="name" defaultValue={nv("name", name)} required error={ns.errors?.name} />
          </Field>
          <Flash ok={ns.ok} message={ns.message} />
          <SubmitButton>Guardar nombre</SubmitButton>
        </form>
      </Card>
      <Card>
        <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Cambiar clave</h2>
        <form action={passAction} className="space-y-3">
          <Field label="Clave actual" htmlFor="oldPassword" error={pe.oldPassword}>
            <Input name="oldPassword" type="password" autoComplete="current-password" required error={pe.oldPassword} />
          </Field>
          <Field label="Clave nueva" htmlFor="password" error={pe.password} hint="Mínimo 8 caracteres.">
            <Input name="password" type="password" autoComplete="new-password" required error={pe.password} />
          </Field>
          <Field label="Repite la clave nueva" htmlFor="passwordConfirm" error={pe.passwordConfirm}>
            <Input name="passwordConfirm" type="password" autoComplete="new-password" required error={pe.passwordConfirm} />
          </Field>
          <Flash ok={ps.ok} message={ps.message} />
          <SubmitButton>Cambiar clave</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
