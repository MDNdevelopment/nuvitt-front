"use client";

import { useActionState, useState } from "react";
import { loginAction, registerAction, saveAddressAction, updateProfileAction } from "@/lib/shop/actions/account";
import type { AccountFormState, Address, Customer } from "@/lib/shop/types";
import SubmitButton from "./SubmitButton";
import { Field, Flash, Input, card } from "./ui";

export type AccountLabels = {
  tabs: { login: string; register: string };
  fields: Record<
    "name" | "email" | "password" | "passwordHint" | "passwordConfirm" | "phone" | "phoneHint" | "cedula" | "cedulaHint" | "label" | "labelHint" | "recipient" | "state" | "city" | "line" | "reference",
    string
  >;
  actions: { login: string; loggingIn: string; register: string; registering: string; save: string; saving: string };
};

const initial: AccountFormState = {};
const useVal = (state: AccountFormState) => (key: string, fallback = "") => String(state.values?.[key] ?? fallback);

/** Pestañas Ingresar / Crear cuenta para quien no tiene sesión. */
export function AuthForms({ lang, labels, next }: { lang: string; labels: AccountLabels; next?: string }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  return (
    <div className={`${card} mx-auto max-w-[560px]`}>
      <div role="tablist" className="mb-6 grid grid-cols-2 rounded-lg bg-product-bg p-1">
        {(["login", "register"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2.5 font-raleway text-[15px] font-semibold transition-colors ${tab === t ? "bg-white text-heading-dark shadow-sm" : "text-link-blue"}`}
          >
            {labels.tabs[t]}
          </button>
        ))}
      </div>
      {tab === "login" ? <LoginForm lang={lang} labels={labels} next={next} /> : <RegisterForm lang={lang} labels={labels} next={next} />}
    </div>
  );
}

export function LoginForm({ lang, labels, next }: { lang: string; labels: AccountLabels; next?: string }) {
  const [state, action] = useActionState(loginAction.bind(null, lang), initial);
  const val = useVal(state);
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label={labels.fields.email} htmlFor="login-email">
        <Input id="login-email" name="email" type="email" autoComplete="username" required defaultValue={val("email")} />
      </Field>
      <Field label={labels.fields.password} htmlFor="login-password">
        <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Flash message={state.message} />
      <SubmitButton label={labels.actions.login} pendingLabel={labels.actions.loggingIn} />
    </form>
  );
}

function RegisterForm({ lang, labels, next }: { lang: string; labels: AccountLabels; next?: string }) {
  const [state, action] = useActionState(registerAction.bind(null, lang), initial);
  const val = useVal(state);
  const err = state.errors ?? {};
  const f = labels.fields;
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label={f.name} htmlFor="reg-name" error={err.name}>
        <Input id="reg-name" name="name" autoComplete="name" required defaultValue={val("name")} error={err.name} />
      </Field>
      <Field label={f.email} htmlFor="reg-email" error={err.email}>
        <Input id="reg-email" name="email" type="email" autoComplete="email" required defaultValue={val("email")} error={err.email} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.phone} htmlFor="reg-phone" hint={f.phoneHint} error={err.phone}>
          <Input id="reg-phone" name="phone" type="tel" autoComplete="tel" required defaultValue={val("phone")} error={err.phone} />
        </Field>
        <Field label={f.cedula} htmlFor="reg-cedula" hint={f.cedulaHint} error={err.cedula}>
          <Input id="reg-cedula" name="cedula" required defaultValue={val("cedula")} error={err.cedula} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.password} htmlFor="reg-password" hint={f.passwordHint} error={err.password}>
          <Input id="reg-password" name="password" type="password" autoComplete="new-password" minLength={8} required error={err.password} />
        </Field>
        <Field label={f.passwordConfirm} htmlFor="reg-confirm" error={err.passwordConfirm}>
          <Input id="reg-confirm" name="passwordConfirm" type="password" autoComplete="new-password" minLength={8} required error={err.passwordConfirm} />
        </Field>
      </div>
      <Flash message={state.message} />
      <SubmitButton label={labels.actions.register} pendingLabel={labels.actions.registering} />
    </form>
  );
}

export function ProfileForm({ lang, user, labels }: { lang: string; user: Customer; labels: AccountLabels }) {
  const [state, action] = useActionState(updateProfileAction.bind(null, lang), initial);
  const val = useVal(state);
  const err = state.errors ?? {};
  const f = labels.fields;
  return (
    <form action={action} className="space-y-4">
      <Field label={f.email} htmlFor="p-email">
        <Input id="p-email" value={user.email} readOnly disabled />
      </Field>
      <Field label={f.name} htmlFor="p-name" error={err.name}>
        <Input id="p-name" name="name" autoComplete="name" required defaultValue={val("name", user.name)} error={err.name} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.phone} htmlFor="p-phone" hint={f.phoneHint} error={err.phone}>
          <Input id="p-phone" name="phone" type="tel" autoComplete="tel" required defaultValue={val("phone", user.phone)} error={err.phone} />
        </Field>
        <Field label={f.cedula} htmlFor="p-cedula" hint={f.cedulaHint} error={err.cedula}>
          <Input id="p-cedula" name="cedula" required defaultValue={val("cedula", user.cedula)} error={err.cedula} />
        </Field>
      </div>
      <Flash ok={state.ok} message={state.message} />
      <SubmitButton label={labels.actions.save} pendingLabel={labels.actions.saving} />
    </form>
  );
}

export function AddressForm({ lang, address, labels, next }: { lang: string; address?: Address; labels: AccountLabels; next?: string }) {
  const [state, action] = useActionState(saveAddressAction.bind(null, lang, address?.id), initial);
  const val = useVal(state);
  const err = state.errors ?? {};
  const f = labels.fields;
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label={f.label} htmlFor="a-label" hint={f.labelHint}>
        <Input id="a-label" name="label" maxLength={60} defaultValue={val("label", address?.label)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.recipient} htmlFor="a-recipient" error={err.recipient}>
          <Input id="a-recipient" name="recipient" autoComplete="name" required defaultValue={val("recipient", address?.recipient)} error={err.recipient} />
        </Field>
        <Field label={f.phone} htmlFor="a-phone" hint={f.phoneHint} error={err.phone}>
          <Input id="a-phone" name="phone" type="tel" autoComplete="tel" required defaultValue={val("phone", address?.phone)} error={err.phone} />
        </Field>
        <Field label={f.state} htmlFor="a-state" error={err.state}>
          <Input id="a-state" name="state" autoComplete="address-level1" required defaultValue={val("state", address?.state)} error={err.state} />
        </Field>
        <Field label={f.city} htmlFor="a-city" error={err.city}>
          <Input id="a-city" name="city" autoComplete="address-level2" required defaultValue={val("city", address?.city)} error={err.city} />
        </Field>
      </div>
      <Field label={f.line} htmlFor="a-line" error={err.line}>
        <Input id="a-line" name="line" autoComplete="street-address" required defaultValue={val("line", address?.line)} error={err.line} />
      </Field>
      <Field label={f.reference} htmlFor="a-reference">
        <Input id="a-reference" name="reference" defaultValue={val("reference", address?.reference)} />
      </Field>
      <Flash message={state.message} />
      <SubmitButton label={labels.actions.save} pendingLabel={labels.actions.saving} />
    </form>
  );
}
