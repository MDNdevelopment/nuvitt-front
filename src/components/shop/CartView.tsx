"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart, useLiveCatalog } from "@/lib/shop/cart";
import { formatBs, formatUsd, usdToBs } from "@/lib/shop/format";
import type { Locale } from "@/lib/i18n";
import { BagIcon, TrashIcon } from "./icons";
import QtyStepper from "./QtyStepper";
import TrustBadges, { type TrustLabels } from "./TrustBadges";

export type CartMeta = Record<string, { name: string; src: string; width: number; height: number; href: string; tint: string; spec: string }>;

export type CartLabels = {
  empty: string;
  emptyCta: string;
  product: string;
  unit: string;
  subtotal: string;
  remove: string;
  loading: string;
  unavailable: string;
  stockLimit: string;
  notice: string;
  checkout: string;
  continue: string;
  total: string;
  quantity: string;
  increase: string;
  decrease: string;
  shipping: string;
  shippingLater: string;
  items: string;
  orderSummary: string;
  trust: TrustLabels;
};

type Props = { lang: Locale; meta: CartMeta; labels: CartLabels; productsHref: string; checkoutHref: string };

export default function CartView({ lang, meta, labels, productsHref, checkoutHref }: Props) {
  const { lines, setQty, remove } = useCart();
  const live = useLiveCatalog();
  const ready = !!live?.enabled;
  const rate = live?.rate ?? 0;

  // Si el stock bajó por debajo de la cantidad elegida, se ajusta sola.
  useEffect(() => {
    if (!live?.enabled) return;
    for (const l of lines) {
      const it = live.items[l.slug];
      if (it && it.stock > 0 && l.qty > it.stock) setQty(l.id, it.stock);
    }
  }, [live, lines, setQty]);

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border border-[#dce6f1] bg-gradient-to-b from-white to-[#eef5fa] px-6 py-20 text-center shadow-[0_18px_40px_-24px_rgba(30,92,130,0.35)]">
        <span className="mx-auto grid size-24 place-items-center rounded-full bg-product-bg text-link-blue">
          <BagIcon className="size-11" />
        </span>
        <p className="mt-6 font-raleway text-2xl font-bold text-heading-dark">{labels.empty}</p>
        <Link href={productsHref} className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-link-blue to-primary-dark px-9 font-manrope text-base font-bold text-white shadow-[0_10px_22px_-8px_rgba(0,108,159,0.7)] transition hover:-translate-y-0.5">
          {labels.emptyCta}
        </Link>
      </div>
    );
  }

  const priced = lines.map((l) => {
    const it = live?.items[l.slug];
    return { line: l, item: it, unavailable: ready && !it };
  });
  const buyable = priced.some((p) => p.item && p.item.stock > 0);
  const subtotal = priced.reduce((sum, p) => (p.item ? sum + p.item.price_usd * p.line.qty : sum), 0);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <p className="mb-4 font-manrope text-sm font-semibold text-slate">{labels.items.replace("{n}", String(count))}</p>
        <ul className="space-y-4">
          {priced.map(({ line, item, unavailable }) => {
            const m = meta[line.slug];
            const max = Math.max(1, Math.min(99, item?.stock ?? 99));
            return (
              <li key={line.id} className="flex gap-4 rounded-3xl border border-[#dce6f1] bg-white p-4 shadow-[0_10px_28px_-18px_rgba(30,92,130,0.3)] sm:gap-6 sm:p-5">
                {m ? (
                  <Link href={m.href} className="grid size-[104px] shrink-0 place-items-center rounded-2xl sm:size-[132px]" style={{ background: `radial-gradient(circle at 50% 45%, #ffffff 0%, ${m.tint} 85%)` }}>
                    <Image src={m.src} width={m.width} height={m.height} alt="" sizes="110px" className="h-[84px] w-auto drop-shadow-[0_8px_8px_rgba(30,60,90,0.2)] sm:h-[108px]" />
                  </Link>
                ) : (
                  <span className="size-[104px] shrink-0 rounded-2xl bg-[#eef1f4] sm:size-[132px]" />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 className="font-raleway text-lg font-bold leading-tight text-heading-deep sm:text-xl">
                    {m ? <Link href={m.href} className="hover:text-primary">{m.name}</Link> : line.slug}
                  </h2>
                  {m && <p className="mt-1 font-montserrat text-xs font-semibold text-secondary">{m.spec}</p>}

                  {unavailable ? (
                    <p className="mt-2 text-sm font-medium text-[#c62828]" role="alert">{labels.unavailable}</p>
                  ) : item ? (
                    <>
                      <p className="mt-1.5 text-sm text-secondary">
                        {formatUsd(item.price_usd, lang)}
                        {rate > 0 && <span className="text-body"> · {formatBs(usdToBs(item.price_usd, rate), lang)}</span>}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-3">
                        <QtyStepper size="sm" value={line.qty} max={max} onChange={(n) => setQty(line.id, n)} labels={labels} />
                        <p className="font-raleway text-xl font-extrabold text-heading-dark">{formatUsd(item.price_usd * line.qty, lang)}</p>
                      </div>
                      {line.qty >= max && item.stock < 99 && (
                        <p className="mt-2 text-xs text-[#a96400]">{labels.stockLimit.replace("{n}", String(item.stock))}</p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-body">{labels.loading}</p>
                  )}

                  <button type="button" onClick={() => remove(line.id)} aria-label={`${labels.remove}: ${m?.name ?? line.slug}`} className="mt-3 inline-flex items-center gap-1.5 self-start font-manrope text-[13px] font-semibold text-slate transition-colors hover:text-[#c62828]">
                    <TrashIcon className="size-4" />
                    {labels.remove}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <Link href={productsHref} className="mt-6 inline-flex items-center gap-2 font-manrope text-sm font-semibold text-link-blue hover:underline">
          <span aria-hidden="true">←</span>
          {labels.continue}
        </Link>
      </div>

      <aside className="rounded-3xl border border-primary-light2/70 bg-gradient-to-br from-white via-[#f3f9fd] to-[#d8e9f3] p-6 shadow-[0_18px_40px_-18px_rgba(30,92,130,0.35)] lg:sticky lg:top-[110px]">
        <h2 className="font-raleway text-xl font-bold text-heading-dark">{labels.orderSummary}</h2>
        <dl className="mt-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <dt className="text-secondary">{labels.subtotal}</dt>
            <dd className="font-semibold text-ink">{ready ? formatUsd(subtotal, lang) : "—"}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <dt className="text-secondary">{labels.shipping}</dt>
            <dd className="text-right text-body">{labels.shippingLater}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-primary-light2/60 pt-4">
            <dt className="font-raleway text-lg font-bold text-heading-dark">{labels.total}</dt>
            <dd className="bg-gradient-to-r from-heading-dark to-link-blue bg-clip-text font-raleway text-[30px] font-extrabold leading-none text-transparent">{ready ? formatUsd(subtotal, lang) : "—"}</dd>
          </div>
          {ready && rate > 0 && (
            <p className="text-right text-sm font-medium text-secondary">≈ {formatBs(usdToBs(subtotal, rate), lang)}</p>
          )}
        </dl>
        <p className="mt-4 text-xs leading-5 text-body">{labels.notice}</p>
        {ready && buyable ? (
          <Link href={checkoutHref} className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-link-blue to-primary-dark font-manrope text-base font-bold text-white shadow-[0_10px_22px_-8px_rgba(0,108,159,0.7)] transition hover:-translate-y-0.5">
            {labels.checkout}
          </Link>
        ) : (
          <button type="button" disabled className="mt-5 h-12 w-full cursor-not-allowed rounded-full bg-gradient-to-r from-[#b9c4cf] to-[#a5b2bf] font-manrope text-base font-bold text-white">
            {labels.checkout}
          </button>
        )}
        <div className="mt-6 border-t border-primary-light2/60 pt-5">
          <TrustBadges labels={labels.trust} compact />
        </div>
      </aside>
    </div>
  );
}
