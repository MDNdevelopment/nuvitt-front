"use client";

import { useActionState } from "react";
import { saveZoneAction } from "@/lib/admin/actions/zones";
import type { FormState, Zone } from "@/lib/admin/types";
import SubmitButton from "./SubmitButton";
import { Card, Checkbox, Field, Flash, Input, Select } from "./ui";

export default function ZoneForm({ zone }: { zone?: Zone }) {
  const [state, action] = useActionState<FormState, FormData>(saveZoneAction.bind(null, zone?.id), {});
  const e = state.errors ?? {};
  const val = (key: string, fallback: string | number | undefined) => String(state.values?.[key] ?? fallback ?? "");

  return (
    <form action={action} className="space-y-5">
      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre (español)" htmlFor="name_es" error={e.name_es}>
          <Input name="name_es" defaultValue={val("name_es", zone?.name_es)} required error={e.name_es} />
        </Field>
        <Field label="Nombre (inglés)" htmlFor="name_en" error={e.name_en}>
          <Input name="name_en" defaultValue={val("name_en", zone?.name_en)} required error={e.name_en} />
        </Field>
        <Field label="Tipo" htmlFor="kind" error={e.kind}>
          <Select name="kind" defaultValue={val("kind", zone?.kind ?? "local")} error={e.kind}>
            <option value="local">Delivery local</option>
            <option value="national">Envío nacional</option>
          </Select>
        </Field>
        <Field label="Courier" htmlFor="courier" hint="Solo aplica a envíos nacionales." error={e.courier}>
          <Select name="courier" defaultValue={val("courier", zone?.courier)} error={e.courier}>
            <option value="">—</option>
            <option value="mrw">MRW</option>
            <option value="zoom">Zoom</option>
            <option value="tealca">Tealca</option>
            <option value="other">Otro</option>
          </Select>
        </Field>
        <Field label="Tarifa (USD)" htmlFor="price_usd" hint="0 = envío sin costo." error={e.price_usd}>
          <Input name="price_usd" inputMode="decimal" defaultValue={val("price_usd", zone?.price_usd)} required error={e.price_usd} />
        </Field>
        <Field label="Orden" htmlFor="sort" error={e.sort}>
          <Input name="sort" inputMode="numeric" defaultValue={val("sort", zone?.sort ?? 0)} error={e.sort} />
        </Field>
        <div className="sm:col-span-2">
          <Checkbox name="active" label="Zona activa (los clientes pueden elegirla)" defaultChecked={state.values ? state.values.active === "on" : zone?.active} />
        </div>
      </Card>
      <Flash ok={state.ok} message={state.message} />
      <SubmitButton>{zone ? "Guardar cambios" : "Crear zona"}</SubmitButton>
    </form>
  );
}
