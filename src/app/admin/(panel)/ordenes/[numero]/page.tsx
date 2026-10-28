import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderActions from "@/components/admin/OrderActions";
import { Badge, btnGhost, Card, PageHeader } from "@/components/admin/ui";
import { getOrderByNumber, listOrderEvents, listOrderPayments } from "@/lib/admin/data";
import { formatBs, formatDate, formatUsd } from "@/lib/admin/format";
import { METHOD_LABEL, nextStatuses, PAYMENT_LABEL, STATUS_LABEL, STATUS_TONE } from "@/lib/admin/order-flow";
import { requireStaff } from "@/lib/admin/session";

type Props = { params: Promise<{ numero: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { numero } = await params;
  return { title: `Orden #${numero}` };
}

const label = (s: string) => (STATUS_LABEL as Record<string, string>)[s] ?? s;

export default async function OrderDetailPage({ params }: Props) {
  const { token, user } = await requireStaff();
  const { numero } = await params;
  if (!/^\d{1,9}$/.test(numero)) notFound();
  const order = await getOrderByNumber(token, Number(numero));
  if (!order) notFound();
  const [events, payments] = await Promise.all([listOrderEvents(token, order.id), listOrderPayments(token, order.id)]);
  const customer = order.expand?.user;
  const addr = order.address;

  return (
    <>
      <PageHeader
        title={`Orden #${order.number}`}
        subtitle={`Creada el ${formatDate(order.created)}`}
        actions={
          <>
            <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
            <Link href="/admin/ordenes/" className={btnGhost}>
              Volver
            </Link>
          </>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card>
            <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Productos</h2>
            <ul className="divide-y divide-[#eef1f4]">
              {order.items.map((it) => (
                <li key={it.product} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                  <span>
                    <span className="font-semibold text-ink">{it.name_es}</span>
                    <span className="text-slate"> · {it.qty} × {formatUsd(it.price_usd)}</span>
                  </span>
                  <span className="font-semibold">{formatUsd(it.price_usd * it.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-[#eef1f4] pt-3 text-sm">
              <Row label="Subtotal" value={formatUsd(order.subtotal_usd)} />
              {order.discount_usd > 0 && <Row label={`Descuento${order.coupon_code ? ` (${order.coupon_code})` : ""}`} value={`− ${formatUsd(order.discount_usd)}`} />}
              <Row label="Envío" value={order.shipping_usd > 0 ? formatUsd(order.shipping_usd) : "Gratis"} />
              <Row label="Total USD" value={formatUsd(order.total_usd)} strong />
              <Row label="Tasa aplicada" value={`Bs ${order.rate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`} />
              <Row label="Total Bs" value={formatBs(order.total_bs)} strong />
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Historial</h2>
            {events.length === 0 ? (
              <p className="text-sm text-slate">Sin movimientos todavía.</p>
            ) : (
              <ol className="space-y-3">
                {events.map((ev) => (
                  <li key={ev.id} className="flex gap-3 text-sm">
                    <span aria-hidden className={`mt-1.5 size-2.5 shrink-0 rounded-full ${ev.public ? "bg-primary-dark" : "bg-[#b9c4cf]"}`} />
                    <div>
                      <p className="font-semibold text-ink">
                        {ev.from_status === ev.to_status ? "Nota" : `${label(ev.from_status)} → ${label(ev.to_status)}`}{" "}
                        <Badge tone={ev.public ? "blue" : "gray"}>{ev.public ? "Visible al cliente" : "Interna"}</Badge>
                      </p>
                      <p className="text-xs text-slate">
                        {formatDate(ev.created)}
                        {ev.expand?.author ? ` · ${ev.expand.author.name || ev.expand.author.email}` : " · sistema"}
                      </p>
                      {ev.note && <p className="mt-0.5 text-ink">{ev.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Pagos</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-slate">Esta orden no tiene intentos de pago registrados.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="rounded-md border border-[#eef1f4] p-3">
                    <p className="font-semibold text-ink">
                      {METHOD_LABEL[p.method] ?? p.method.toUpperCase()} · {PAYMENT_LABEL[p.status] ?? p.status} · {formatBs(p.amount_bs)}
                      {p.method === "zelle" && p.amount_usd ? ` (US$ ${p.amount_usd.toFixed(2)})` : ""}
                    </p>
                    <p className="text-xs text-slate">
                      {formatDate(p.created)}
                      {p.payer_name ? ` · Titular ${p.payer_name}` : ""}
                      {p.bank ? ` · Banco ${p.bank}` : ""}
                      {p.reference ? ` · Ref. ${p.reference}` : ""}
                      {p.response_code ? ` · Código ${p.response_code}` : ""}
                    </p>
                    {p.response_message && <p className="mt-1 text-ink">{p.response_message}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Cliente</h2>
            {customer ? (
              <div className="text-sm text-ink">
                <p className="font-semibold">{customer.name || "—"}</p>
                <p>{customer.email}</p>
                <p>{customer.phone}</p>
                <p>Cédula/RIF: {customer.cedula || "—"}</p>
                {user.role === "admin" && (
                  <Link href={`/admin/usuarios/${customer.id}/`} className="mt-2 inline-block font-semibold text-primary-dark hover:underline">
                    Ver cliente
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate">Cliente no disponible.</p>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Entrega</h2>
            <p className="text-sm font-semibold text-ink">{order.zone_name || "—"}</p>
            {addr && (
              <p className="mt-1 text-sm text-ink">
                {addr.recipient} · {addr.phone}
                <br />
                {addr.line}, {addr.city}, {addr.state}
                {addr.reference ? <><br />{addr.reference}</> : null}
              </p>
            )}
            {order.customer_note && <p className="mt-2 rounded bg-[#f4f7fa] p-2 text-sm text-ink">Nota del cliente: {order.customer_note}</p>}
          </Card>

          <OrderActions number={order.number} status={order.status} courier={order.courier} tracking={order.tracking} next={nextStatuses(order.status)} />
        </div>
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate">{label}</dt>
      <dd className={strong ? "font-raleway text-base font-bold text-heading-dark" : "font-semibold text-ink"}>{value}</dd>
    </div>
  );
}
