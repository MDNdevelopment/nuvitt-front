"use client";

import { openDrawer, useCart, useLiveCatalog } from "@/lib/shop/cart";
import { formatBs, formatUsd, usdToBs } from "@/lib/shop/format";
import type { BuyLabels } from "@/lib/shop/labels";
import type { Locale } from "@/lib/i18n";
import { CartIcon } from "./icons";

export type CardOffer = { id: string; usd: number; stock: number; rate: number };

type Props = {
  lang: Locale;
  slug: string;
  /** Datos del HTML (pueden estar hasta 60 s atrasados); el cliente los confirma con /api/catalog/. */
  initial: CardOffer;
  labels: BuyLabels;
};

/** Precio y compra rápida en las tarjetas del catálogo. */
export default function CardBuy({ lang, slug, initial, labels }: Props) {
  const live = useLiveCatalog();
  const { add } = useCart();

  const liveItem = live?.items[slug];
  if (live?.enabled && !liveItem) return null;
  const item = liveItem ? { id: liveItem.id, usd: liveItem.price_usd, stock: liveItem.stock } : initial;
  const rate = (live?.enabled && live.rate) || initial.rate || 0;

  const soldOut = item.stock <= 0;
  const low = !soldOut && item.stock <= 5;
  const bs = rate > 0 ? usdToBs(item.usd, rate) : null;

  const onAdd = () => {
    add({ id: item.id, slug, qty: 1 }, item.stock);
    openDrawer();
  };

  return (
    <div className="w-full">
      <div className="border-t border-[#e6edf3] pt-4 text-center">
        <p className="font-raleway text-[26px] font-extrabold leading-none text-heading-dark">{formatUsd(item.usd, lang)}</p>
        {bs !== null && <p className="mt-1.5 text-xs font-medium text-secondary">≈ {formatBs(bs, lang)}</p>}
        {/* Altura reservada: con o sin aviso de stock todas las tarjetas miden igual. */}
        <p className={`mt-1.5 inline-flex min-h-4 items-center gap-1.5 text-xs font-bold ${soldOut ? "text-slate" : "text-[#9a5b00]"}`}>
          {(soldOut || low) && (
            <>
              <span className={`size-1.5 rounded-full ${soldOut ? "bg-[#9aa7b4]" : "bg-[#f59e0b]"}`} />
              {soldOut ? labels.outOfStock : labels.lowStock.replace("{n}", String(item.stock))}
            </>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={soldOut}
        className="relative z-10 mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-link-blue font-manrope text-[15px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(0,108,159,0.8)] transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#b9c4cf] disabled:shadow-none"
      >
        <CartIcon className="size-[18px]" />
        {soldOut ? labels.outOfStock : labels.add}
      </button>
    </div>
  );
}
