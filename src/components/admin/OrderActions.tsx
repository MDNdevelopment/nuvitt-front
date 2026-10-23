"use client";

import { useActionState } from "react";
import { addOrderNoteAction, updateOrderAction, updateShippingAction } from "@/lib/admin/actions/orders";
import { STATUS_LABEL, type OrderStatus } from "@/lib/admin/order-flow";
import type { FormState } from "@/lib/admin/types";
import SubmitButton from "./SubmitButton";
import { Card, Checkbox, Field, Flash, Input, Select, Textarea } from "./ui";

type Props = {
  number: number;
  status: OrderStatus;
  courier: string;
  tracking: string;
  next: OrderStatus[];
};

const COURIER_OPTIONS = [
  ["", "Sin courier (entrega local)"],
  ["mrw", "MRW"],
  ["zoom", "Zoom"],
  ["tealca", "Tealca"],
  ["other", "Otro"],
];

const none: FormState = {};
const useVal = (s: FormState) => (k: string, d = "") => String(s.values?.[k] ?? d);

export default function OrderActions({ number, status, courier, tracking, next }: Props) {
  const [st, statusAction] = useActionState(updateOrderAction.bind(null, number), none);
  const [nt, noteAction] = useActionState(addOrderNoteAction.bind(null, number), none);
  const [sh, shipAction] = useActionState(updateShippingAction.bind(null, number), none);
  const sv = useVal(st);
  const nv = useVal(nt);
  const hv = useVal(sh);
  const target = sv("status", next[0]) as OrderStatus;
  const resolving = status === "por_verificar" && target === "pagada";
  const shipping = target === "enviada";

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Cambiar estado</h2>
        {next.length === 0 ? (
          <p className="text-sm text-slate">Esta orden está en un estado final ({STATUS_LABEL[status]}); ya no puede cambiar.</p>
        ) : (
          <form action={statusAction} className="space-y-3">
            <Field label="Nuevo estado" htmlFor="status">
              <Select name="status" defaultValue={sv("status", next[0])} key={`${status}-${st.ok}`}>
                {next.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>
            {status === "por_verificar" && (
              <Field label="Referencia del pago verificado" htmlFor="reference" error={st.errors?.reference} hint="Solo si la marcas como pagada: la referencia que viste en el estado de cuenta.">
                <Input name="reference" defaultValue={sv("reference")} error={st.errors?.reference} />
              </Field>
            )}
            {status === "en_preparacion" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Courier" htmlFor="courier" hint="Solo se usa si el nuevo estado es «Enviada».">
                  <Select name="courier" defaultValue={sv("courier", courier)}>
                    {COURIER_OPTIONS.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Número de guía" htmlFor="tracking" error={st.errors?.tracking} hint="Obligatorio si hay courier.">
                  <Input name="tracking" defaultValue={sv("tracking", tracking)} error={st.errors?.tracking} />
                </Field>
              </div>
            )}
            <Field label="Nota (opcional)" htmlFor="note" hint={resolving ? "Queda en el historial." : undefined}>
              <Textarea name="note" rows={2} maxLength={500} defaultValue={sv("note")} />
            </Field>
            <Checkbox name="public" label="Visible para el cliente" defaultChecked={st.values ? st.values.public === "on" : true} />
            <Flash ok={st.ok} message={st.message} />
            <SubmitButton pendingLabel="Guardando…">{shipping ? "Marcar como enviada" : "Actualizar estado"}</SubmitButton>
          </form>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Envío</h2>
        <form action={shipAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Courier" htmlFor="ship-courier">
              <Select id="ship-courier" name="courier" defaultValue={hv("courier", courier)} key={`c-${courier}-${sh.ok}`}>
                {COURIER_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Número de guía" htmlFor="ship-tracking" error={sh.errors?.tracking}>
              <Input id="ship-tracking" name="tracking" defaultValue={hv("tracking", tracking)} key={`t-${tracking}-${sh.ok}`} error={sh.errors?.tracking} />
            </Field>
          </div>
          <Flash ok={sh.ok} message={sh.message} />
          <SubmitButton pendingLabel="Guardando…">Guardar envío</SubmitButton>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Agregar nota</h2>
        <form action={noteAction} className="space-y-3">
          <Field label="Nota" htmlFor="note-text" error={nt.errors?.note}>
            <Textarea id="note-text" name="note" rows={2} maxLength={500} defaultValue={nv("note")} error={nt.errors?.note} />
          </Field>
          <Checkbox name="public" label="Visible para el cliente" defaultChecked={nt.values ? nt.values.public === "on" : false} />
          <Flash ok={nt.ok} message={nt.message} />
          <SubmitButton pendingLabel="Guardando…">Agregar al historial</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
