import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderStatusBadge from "@/components/shop/OrderStatusBadge";
import { btnGhost, card } from "@/components/shop/ui";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { listOrders } from "@/lib/shop/data";
import { formatBs, formatDate, formatUsd } from "@/lib/shop/format";
import { requireCustomer } from "@/lib/shop/session";

export async function generateMetadata({ params }: PageProps<"/[lang]/cuenta/pedidos">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "/cuenta/pedidos/", title: `${dict.account.orders.title} | Nuvitt`, description: dict.account.meta.description, noindex: true });
}

export default async function OrdersPage({ params }: PageProps<"/[lang]/cuenta/pedidos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const o = dict.account.orders;
  const { token } = await requireCustomer(lang);
  const orders = await listOrders(token);

  if (orders.length === 0) {
    return (
      <div className={`${card} py-12 text-center`}>
        <p className="font-raleway text-xl font-semibold text-heading-dark">{o.empty}</p>
        <Link href={localePath(lang, "/productos/")} className="mt-6 inline-block rounded bg-link-blue px-7 py-[15px] font-manrope text-base font-semibold text-white transition-colors hover:bg-primary-dark">
          {o.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id} className={`${card} flex flex-wrap items-center justify-between gap-4`}>
          <div>
            <p className="font-raleway text-xl font-bold text-heading-deep">{o.number.replace("{n}", String(order.number))}</p>
            <p className="text-sm text-body">{formatDate(order.created, lang)}</p>
          </div>
          <OrderStatusBadge status={order.status} label={dict.account.statuses[order.status] ?? order.status} />
          <div className="text-right">
            <p className="font-raleway text-lg font-bold text-heading-dark">{formatUsd(order.total_usd, lang)}</p>
            <p className="text-sm text-body">{formatBs(order.total_bs, lang)}</p>
          </div>
          <Link href={localePath(lang, `/cuenta/pedidos/${order.number}/`)} className={btnGhost}>
            {o.view}
          </Link>
        </li>
      ))}
    </ul>
  );
}
