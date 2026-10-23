"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart, useLiveCatalog } from "@/lib/shop/cart";
import { formatBs, formatUsd, usdToBs } from "@/lib/shop/format";
import type { BuyLabels } from "@/lib/shop/labels";
import type { Locale } from "@/lib/i18n";
import { CartIcon, MinusIcon, PlusIcon } from "./icons";

type Initial = { id: string; usd: number; stock: number; rate: number } | null;

type Props = {
  lang: Locale;
  slug: string;
  /** Datos del HTML (pueden estar hasta 60 s atrasados); el cliente los confirma con /api/catalog/. */
  initial: Initial;
  labels: BuyLabels;
  cartHref: string;
  compact?: boolean;
};

/** Precio en USD y Bs + botón de compra. El servidor siempre recalcula al cobrar. */
export default function AddToCart({ lang, slug, initial, labels, cartHref, compact }: Props) {
  const live = useLiveCatalog();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

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
    add({ id: item.id, slug, qty: compact ? 1 : qty }, item.stock);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2500);
  };

  const price = (
    <div className={compact ? "text-center" : ""}>
      <p className={`font-raleway font-bold text-heading-dark ${compact ? "text-xl" : "text-[32px] leading-none"}`}>
        {formatUsd(item.usd, lang)}
      </p>
      {bs !== null && (
        <p className={`text-secondary ${compact ? "mt-0.5 text-xs" : "mt-1.5 text-[15px]"}`}>{formatBs(bs, lang)}</p>
      )}
    </div>
  );

  const button = (
    <button
      type="button"
      onClick={onAdd}
      disabled={soldOut}
      className={`inline-flex items-center justify-center gap-2 rounded font-manrope font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#b9c4cf] ${
        compact ? "bg-link-blue px-4 py-2 text-sm hover:bg-primary-dark" : "bg-link-blue px-7 py-[17px] text-base leading-4 hover:bg-primary-dark"
      }`}
    >
      <CartIcon className="size-[18px]" />
      {soldOut ? labels.outOfStock : labels.addToCart}
    </button>
  );

  const status = (
    <p role="status" aria-live="polite" className="min-h-5 text-sm font-medium text-[#2e7d32]">
      {added && (
        <>
          {labels.added}{" "}
          <Link href={cartHref} className="underline">
            {labels.viewCart}
          </Link>
        </>
      )}
    </p>
  );

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2.5">
        {price}
        {button}
        {status}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-primary-light2 bg-white px-6 py-5">
      {price}
      {bs !== null && <p className="mt-2 text-xs text-body">{labels.rateNote.replace("{rate}", rate.toLocaleString(lang === "es" ? "es-VE" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {!soldOut && (
          <div role="group" aria-label={labels.quantity} className="inline-flex items-center rounded border border-primary-light2">
            <button type="button" aria-label={labels.decrease} onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="grid size-11 place-items-center text-link-blue disabled:opacity-40">
              <MinusIcon className="size-4" />
            </button>
            <span aria-live="polite" className="min-w-8 text-center font-semibold text-ink">
              {Math.min(qty, max)}
            </span>
            <button type="button" aria-label={labels.increase} onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} className="grid size-11 place-items-center text-link-blue disabled:opacity-40">
              <PlusIcon className="size-4" />
            </button>
          </div>
        )}
        {button}
      </div>
      <div className="mt-2">{status}</div>
    </div>
  );
}
