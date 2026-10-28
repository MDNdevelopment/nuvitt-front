"use client";

import { useState } from "react";
import { openDrawer, useCart, useLiveCatalog } from "@/lib/shop/cart";
import { formatBs, formatUsd, usdToBs } from "@/lib/shop/format";
import type { BuyLabels } from "@/lib/shop/labels";
import type { Locale } from "@/lib/i18n";
import { CartIcon, InfoIcon } from "./icons";
import QtyStepper from "./QtyStepper";

type Initial = { id: string; usd: number; stock: number; rate: number } | null;

type Props = {
  lang: Locale;
  slug: string;
  /** Datos del HTML (pueden estar hasta 60 s atrasados); el cliente los confirma con /api/catalog/. */
  initial: Initial;
  labels: BuyLabels;
};

/** Precio en USD y Bs + botón de compra. El servidor siempre recalcula al cobrar. */
export default function AddToCart({ lang, slug, initial, labels }: Props) {
  const live = useLiveCatalog();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const liveItem = live?.items[slug];
  // El catálogo vivo cargó bien y el producto ya no figura: dejó de venderse. Si el backend falló
  // (enabled = false) se conservan los datos del HTML en vez de esconder el botón.
  if (live?.enabled && !liveItem) return null;
  const item = liveItem ? { id: liveItem.id, usd: liveItem.price_usd, stock: liveItem.stock } : initial;
  const rate = (live?.enabled && live.rate) || initial?.rate || 0;
  if (!item) return null;

  const soldOut = item.stock <= 0;
  const max = Math.max(1, Math.min(99, item.stock));
  const bs = rate > 0 ? usdToBs(item.usd, rate) : null;

  const onAdd = () => {
    add({ id: item.id, slug, qty }, item.stock);
    openDrawer();
  };

  const rateText = labels.rateNote.replace("{rate}", rate.toLocaleString(lang === "es" ? "es-VE" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const lowStock = !soldOut && item.stock <= 5;
  const badge = soldOut
    ? { text: labels.outOfStock, dot: "bg-[#9aa7b4]", box: "bg-[#eef1f4] text-slate" }
    : lowStock
      ? { text: labels.lowStock.replace("{n}", String(item.stock)), dot: "bg-[#f59e0b]", box: "bg-[#fff4de] text-[#9a5b00]" }
      : { text: labels.inStock, dot: "bg-[#22c55e]", box: "bg-[#e6f7ec] text-[#17803d]" };

  return (
    <div id="buy-box" className="mt-6 rounded-3xl border border-[#dce6f1] bg-white p-6 shadow-[0_10px_28px_-16px_rgba(30,92,130,0.3)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <p className="font-manrope text-xs font-semibold uppercase tracking-[0.16em] text-slate">{labels.price}</p>
          <p className="mt-1 font-raleway text-[44px] font-extrabold leading-none text-heading-dark">
            {formatUsd(item.usd, lang)}
          </p>
          {bs !== null && (
            <p className="mt-3 inline-flex items-center rounded-full border border-[#dce6f1] bg-[#f3f7fa] px-3.5 py-1 font-manrope text-[15px] font-semibold text-ink">
              ≈ {formatBs(bs, lang)}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-manrope text-[13px] font-bold ${badge.box}`}>
          <span className={`size-2 rounded-full ${badge.dot}`} />
          {badge.text}
        </span>
      </div>
      {bs !== null && (
        <p className="mt-4 flex items-start gap-2 text-[13px] leading-5 text-secondary">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-link-blue" />
          {rateText}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#e6edf3] pt-5">
        {!soldOut && <QtyStepper value={qty} max={max} onChange={(n) => setQty(Math.max(1, Math.min(max, n)))} labels={labels} />}
        <button
          type="button"
          onClick={onAdd}
          disabled={soldOut}
          className="inline-flex h-12 min-w-[220px] flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-link-blue px-8 font-manrope text-base font-bold text-white shadow-[0_10px_22px_-8px_rgba(0,108,159,0.7)] transition hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#b9c4cf] disabled:shadow-none"
        >
          <CartIcon className="size-5" />
          {soldOut ? labels.outOfStock : labels.addToCart}
        </button>
      </div>
    </div>
  );
}
