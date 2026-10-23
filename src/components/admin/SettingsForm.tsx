"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/lib/admin/actions/settings";
import type { FormState, Settings } from "@/lib/admin/types";
import SubmitButton from "./SubmitButton";
import { Card, Field, Flash, Input } from "./ui";

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState<FormState, FormData>(saveSettingsAction.bind(null, settings.id), {});
  const e = state.errors ?? {};
  const val = (key: string, fallback: string | number | undefined) => String(state.values?.[key] ?? fallback ?? "");

  return (
    <form action={action} className="space-y-5">
      <Card className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tasa manual (Bs por USD)"
          htmlFor="rate_override"
          error={e.rate_override}
          hint="Déjala en 0 para usar la tasa automática. Si escribes un valor, manda sobre la automática."
        >
          <Input name="rate_override" inputMode="decimal" defaultValue={val("rate_override", settings.rate_override || 0)} error={e.rate_override} />
        </Field>
        <Field label="Envío gratis desde (USD)" htmlFor="free_shipping_usd" error={e.free_shipping_usd} hint="0 = nunca hay envío gratis.">
          <Input name="free_shipping_usd" inputMode="decimal" defaultValue={val("free_shipping_usd", settings.free_shipping_usd || 0)} error={e.free_shipping_usd} />
        </Field>
      </Card>
      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="RIF del comercio" htmlFor="merchant_rif" error={e.merchant_rif} hint="Ejemplo: J123456789. Es el RIF afiliado a Banco Plaza.">
          <Input name="merchant_rif" defaultValue={val("merchant_rif", settings.merchant_rif)} error={e.merchant_rif} />
        </Field>
        <Field label="Teléfono cobrador" htmlFor="merchant_phone" error={e.merchant_phone} hint="Móvil afiliado al servicio C2P. Sin él los pagos no se habilitan.">
          <Input name="merchant_phone" inputMode="tel" defaultValue={val("merchant_phone", settings.merchant_phone)} error={e.merchant_phone} />
        </Field>
        <Field label="Correo del administrador" htmlFor="admin_email" error={e.admin_email} hint="Recibirá los avisos de órdenes nuevas.">
          <Input name="admin_email" type="email" defaultValue={val("admin_email", settings.admin_email)} error={e.admin_email} />
        </Field>
      </Card>
      <Flash ok={state.ok} message={state.message} />
      <SubmitButton>Guardar ajustes</SubmitButton>
    </form>
  );
}
