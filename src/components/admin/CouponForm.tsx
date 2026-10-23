"use client";

import { useActionState } from "react";
import { saveCouponAction } from "@/lib/admin/actions/coupons";
import { toDateInput } from "@/lib/admin/format";
import type { Coupon, FormState } from "@/lib/admin/types";
import SubmitButton from "./SubmitButton";
import { Card, Checkbox, Field, Flash, Input, Select } from "./ui";

export default function CouponForm({ coupon }: { coupon?: Coupon }) {
  const [state, action] = useActionState<FormState, FormData>(saveCouponAction.bind(null, coupon?.id), {});
  const e = state.errors ?? {};
  const val = (key: string, fallback: string | number | undefined) => String(state.values?.[key] ?? fallback ?? "");

  return (
    <form action={action} className="space-y-5">
      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="Código" htmlFor="code" error={e.code} hint="Se guarda en mayúsculas. Los clientes lo escriben en el checkout.">
          <Input name="code" defaultValue={val("code", coupon?.code)} required className="uppercase" error={e.code} />
        </Field>
        <Field label="Tipo de descuento" htmlFor="kind" error={e.kind}>
          <Select name="kind" defaultValue={val("kind", coupon?.kind ?? "percent")} error={e.kind}>
            <option value="percent">Porcentaje (%)</option>
            <option value="fixed">Monto fijo (USD)</option>
          </Select>
        </Field>
        <Field label="Valor" htmlFor="value" error={e.value} hint="% si es porcentaje, USD si es monto fijo.">
          <Input name="value" inputMode="decimal" defaultValue={val("value", coupon?.value)} required error={e.value} />
        </Field>
        <Field label="Compra mínima (USD)" htmlFor="min_subtotal_usd" error={e.min_subtotal_usd} hint="0 = sin mínimo.">
          <Input name="min_subtotal_usd" inputMode="decimal" defaultValue={val("min_subtotal_usd", coupon?.min_subtotal_usd ?? 0)} error={e.min_subtotal_usd} />
        </Field>
        <Field label="Usos máximos" htmlFor="max_uses" error={e.max_uses} hint={coupon ? `Usados hasta ahora: ${coupon.used}. 0 = ilimitado.` : "0 = ilimitado."}>
          <Input name="max_uses" inputMode="numeric" defaultValue={val("max_uses", coupon?.max_uses ?? 0)} error={e.max_uses} />
        </Field>
        <div />
        <Field label="Vigente desde" htmlFor="starts_at" error={e.starts_at}>
          <Input name="starts_at" type="date" defaultValue={val("starts_at", toDateInput(coupon?.starts_at ?? ""))} error={e.starts_at} />
        </Field>
        <Field label="Vigente hasta (incluido)" htmlFor="ends_at" error={e.ends_at}>
          <Input name="ends_at" type="date" defaultValue={val("ends_at", toDateInput(coupon?.ends_at ?? ""))} error={e.ends_at} />
        </Field>
        <div className="sm:col-span-2">
          <Checkbox name="active" label="Cupón activo" defaultChecked={state.values ? state.values.active === "on" : (coupon?.active ?? true)} />
        </div>
      </Card>
      <Flash ok={state.ok} message={state.message} />
      <SubmitButton>{coupon ? "Guardar cambios" : "Crear cupón"}</SubmitButton>
    </form>
  );
}
