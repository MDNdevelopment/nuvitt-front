"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart, useLiveCatalog } from "@/lib/shop/cart";
import { formatBs, formatUsd, usdToBs } from "@/lib/shop/format";
import type { Locale } from "@/lib/i18n";
import { MinusIcon, PlusIcon, TrashIcon } from "./icons";

export type CartMeta = Record<string, { name: string; src: string; width: number; height: number; href: string }>;

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
      <div className="rounded-2xl border border-[#dce6f1] bg-white px-6 py-14 text-center">
        <p className="font-raleway text-xl font-semibold text-heading-dark">{labels.empty}</p>
        <Link href={productsHref} className="mt-6 inline-block rounded bg-link-blue px-7 py-[15px] font-manrope text-base font-semibold text-white transition-colors hover:bg-primary-dark">
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

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
      <ul className="space-y-4">
        {priced.map(({ line, item, unavailable }) => {
          const m = meta[line.slug];
          const max = Math.max(1, Math.min(99, item?.stock ?? 99));
          return (
            <li key={line.id} className="flex gap-4 rounded-2xl border border-[#dce6f1] bg-white p-4 sm:gap-6 sm:p-5">
              {m ? (
                <Link href={m.href} className="shrink-0">
                  <Image src={m.src} width={m.width} height={m.height} alt="" sizes="96px" className="h-[96px] w-auto sm:h-[110px]" />
                </Link>
              ) : (
                <span className="size-[96px] shrink-0 rounded bg-[#eef1f4]" />
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-raleway text-lg font-bold leading-tight text-heading-deep">
                    {m ? <Link href={m.href}>{m.name}</Link> : line.slug}
                  </h2>
                  <button type="button" onClick={() => remove(line.id)} aria-label={`${labels.remove}: ${m?.name ?? line.slug}`} className="shrink-0 text-slate transition-colors hover:text-[#c62828]">
                    <TrashIcon className="size-5" />
                  </button>
                </div>

                {unavailable ? (
                  <p className="mt-2 text-sm font-medium text-[#c62828]" role="alert">{labels.unavailable}</p>
                ) : item ? (
                  <>
                    <p className="mt-1 text-sm text-secondary">
                      {formatUsd(item.price_usd, lang)}
                      {rate > 0 && <span className="text-body"> · {formatBs(usdToBs(item.price_usd, rate), lang)}</span>}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div role="group" aria-label={labels.quantity} className="inline-flex items-center rounded border border-primary-light2">
                        <button type="button" aria-label={labels.decrease} onClick={() => setQty(line.id, line.qty - 1)} className="grid size-10 place-items-center text-link-blue">
                          <MinusIcon className="size-4" />
                        </button>
                        <span aria-live="polite" className="min-w-8 text-center font-semibold text-ink">{line.qty}</span>
                        <button type="button" aria-label={labels.increase} onClick={() => setQty(line.id, line.qty + 1)} disabled={line.qty >= max} className="grid size-10 place-items-center text-link-blue disabled:opacity-40">
                          <PlusIcon className="size-4" />
                        </button>
                      </div>
                      <p className="font-raleway text-lg font-bold text-heading-dark">{formatUsd(item.price_usd * line.qty, lang)}</p>
                    </div>
                    {line.qty >= max && item.stock < 99 && (
                      <p className="mt-2 text-xs text-[#a96400]">{labels.stockLimit.replace("{n}", String(item.stock))}</p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-body">{labels.loading}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="rounded-2xl border border-[#dce6f1] bg-white p-6 lg:sticky lg:top-[110px]">
        <dl className="space-y-2">
          <div className="flex items-baseline justify-between">
            <dt className="text-secondary">{labels.subtotal}</dt>
            <dd className="font-semibold text-ink">{ready ? formatUsd(subtotal, lang) : "—"}</dd>
          </div>
          {ready && rate > 0 && (
            <div className="flex items-baseline justify-between text-sm">
              <dt className="text-body">{labels.total} (Bs)</dt>
              <dd className="font-semibold text-ink">{formatBs(usdToBs(subtotal, rate), lang)}</dd>
            </div>
          )}
        </dl>
        <p className="mt-4 text-xs leading-5 text-body">{labels.notice}</p>
        {ready && buyable ? (
          <Link href={checkoutHref} className="mt-5 block w-full rounded bg-primary-dark px-6 py-[15px] text-center font-manrope text-base font-semibold text-white transition-colors hover:bg-primary">
            {labels.checkout}
          </Link>
        ) : (
          <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded bg-[#b9c4cf] px-6 py-[15px] font-manrope text-base font-semibold text-white">
            {labels.checkout}
          </button>
        )}
        <Link href={productsHref} className="mt-4 block text-center text-sm font-semibold text-link-blue hover:underline">
          {labels.continue}
        </Link>
      </aside>
    </div>
  );
}
