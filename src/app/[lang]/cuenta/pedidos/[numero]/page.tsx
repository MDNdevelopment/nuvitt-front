import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderStatusBadge from "@/components/shop/OrderStatusBadge";
import { card } from "@/components/shop/ui";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { getOrderByNumber, listOrderEvents, listOrderPayments } from "@/lib/shop/data";
import { formatBs, formatDate, formatUsd } from "@/lib/shop/format";
import { requireCustomer } from "@/lib/shop/session";

export async function generateMetadata({ params }: PageProps<"/[lang]/cuenta/pedidos/[numero]">): Promise<Metadata> {
  const { lang, numero } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: `/cuenta/pedidos/${numero}/`, title: `${dict.account.orders.number.replace("{n}", numero)} | Nuvitt`, description: dict.account.meta.description, noindex: true });
}

export default async function OrderDetailPage({ params }: PageProps<"/[lang]/cuenta/pedidos/[numero]">) {
  const { lang, numero } = await params;
  if (!hasLocale(lang) || !/^\d{1,9}$/.test(numero)) notFound();
  const dict = await getDictionary(lang);
  const a = dict.account;
  const o = a.orders;
  const { token } = await requireCustomer(lang);

  // Las reglas de PocketBase solo devuelven pedidos del propio cliente: uno ajeno es un 404.
  const order = await getOrderByNumber(token, Number(numero));
  if (!order) notFound();
  const [events, payments] = await Promise.all([listOrderEvents(token, order.id), listOrderPayments(token, order.id)]);
  const status = (s: string) => (a.statuses as Record<string, string>)[s] ?? s;
  const addr = order.address;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href={localePath(lang, "/cuenta/pedidos/")} className="text-sm font-semibold text-link-blue hover:underline">
            ← {o.back}
          </Link>
          <h2 className="mt-2 font-raleway text-3xl font-bold text-heading-dark">{o.number.replace("{n}", String(order.number))}</h2>
          <p className="text-sm text-body">{formatDate(order.created, lang)}</p>
        </div>
        <OrderStatusBadge status={order.status} label={status(order.status)} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className={card}>
            <h3 className="mb-4 font-raleway text-xl font-bold text-heading-dark">{o.items}</h3>
            <ul className="divide-y divide-[#e8eef5]">
              {order.items.map((it) => (
                <li key={it.product} className="flex items-baseline justify-between gap-4 py-3">
                  <div>
                    <p className="font-semibold text-ink">{lang === "es" ? it.name_es : it.name_en}</p>
                    <p className="text-sm text-body">
                      {o.qty} {it.qty} × {formatUsd(it.price_usd, lang)}
                    </p>
                  </div>
                  <p className="font-semibold text-ink">{formatUsd(it.price_usd * it.qty, lang)}</p>
                </li>
              ))}
            </ul>
          </section>

          {events.length > 0 && (
            <section className={card}>
              <h3 className="mb-4 font-raleway text-xl font-bold text-heading-dark">{o.timeline}</h3>
              <ol className="space-y-3">
                {events.map((ev) => (
                  <li key={ev.id} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-2.5 shrink-0 rounded-full bg-link-blue" />
                    <div>
                      <p className="font-semibold text-ink">{ev.from_status === ev.to_status ? o.note : status(ev.to_status)}</p>
                      <p className="text-sm text-body">{formatDate(ev.created, lang)}</p>
                      {ev.note && <p className="text-sm text-secondary">{ev.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className={card}>
            <dl className="space-y-2 text-sm">
              <Row label={o.subtotal} value={formatUsd(order.subtotal_usd, lang)} />
              {order.discount_usd > 0 && <Row label={`${o.discount}${order.coupon_code ? ` (${order.coupon_code})` : ""}`} value={`− ${formatUsd(order.discount_usd, lang)}`} />}
              <Row label={o.shipping} value={order.shipping_usd > 0 ? formatUsd(order.shipping_usd, lang) : o.free} />
              <div className="border-t border-[#e8eef5] pt-2">
                <Row label={o.totalUsd} value={formatUsd(order.total_usd, lang)} strong />
              </div>
              <Row label={o.rate} value={`Bs ${order.rate.toLocaleString(lang === "es" ? "es-VE" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`} />
              <Row label={o.totalBs} value={formatBs(order.total_bs, lang)} strong />
            </dl>
          </section>

          <section className={card}>
            <h3 className="mb-3 font-raleway text-lg font-bold text-heading-dark">{o.shippingTo}</h3>
            <p className="text-sm text-secondary">{order.zone_name}</p>
            {addr && (
              <p className="mt-2 text-sm text-secondary">
                {addr.recipient} · {addr.phone}
                <br />
                {addr.line}, {addr.city}, {addr.state}
                {addr.reference ? <><br />{addr.reference}</> : null}
              </p>
            )}
            {order.courier && <p className="mt-3 text-sm text-secondary">{o.courier}: <span className="font-semibold uppercase">{order.courier}</span></p>}
            {order.tracking && <p className="text-sm text-secondary">{o.tracking}: <span className="font-semibold">{order.tracking}</span></p>}
          </section>

          {payments.length > 0 && (
            <section className={card}>
              <h3 className="mb-3 font-raleway text-lg font-bold text-heading-dark">{o.payment}</h3>
              {payments.map((p) => (
                <p key={p.id} className="text-sm text-secondary">
                  {(a.paymentStatuses as Record<string, string>)[p.status] ?? p.status}
                  {p.reference ? ` · Ref. ${p.reference}` : ""} · {formatBs(p.amount_bs, lang)}
                </p>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-body">{label}</dt>
      <dd className={strong ? "font-raleway text-base font-bold text-heading-dark" : "font-semibold text-ink"}>{value}</dd>
    </div>
  );
}
