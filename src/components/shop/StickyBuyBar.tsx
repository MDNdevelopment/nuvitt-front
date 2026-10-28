"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { openDrawer, useCart, useLiveCatalog } from "@/lib/shop/cart";
import { formatUsd } from "@/lib/shop/format";
import type { BuyLabels } from "@/lib/shop/labels";
import type { Locale } from "@/lib/i18n";
import { CartIcon } from "./icons";

type Props = {
  lang: Locale;
  slug: string;
  name: string;
  image: { src: string; width: number; height: number };
  tint: string;
  initial: { id: string; usd: number; stock: number };
  labels: BuyLabels;
  /** id del recuadro de compra: la barra aparece cuando este sale de la pantalla hacia arriba. */
  targetId: string;
};

/** Barra de compra fija en móvil: precio y botón Agregar mientras el recuadro principal no se ve. */
export default function StickyBuyBar({ lang, slug, name, image, tint, initial, labels, targetId }: Props) {
  const live = useLiveCatalog();
  const { add } = useCart();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);

  const liveItem = live?.items[slug];
  if (live?.enabled && !liveItem) return null;
  const item = liveItem ? { id: liveItem.id, usd: liveItem.price_usd, stock: liveItem.stock } : initial;
  const soldOut = item.stock <= 0;

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#dce6f1] bg-white/95 px-4 py-3 shadow-[0_-10px_30px_-12px_rgba(30,92,130,0.35)] backdrop-blur transition-transform duration-300 min-[1025px]:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="mx-auto flex max-w-[560px] items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl" style={{ background: tint }}>
          <Image src={image.src} width={image.width} height={image.height} alt="" sizes="48px" className="h-10 w-auto" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-raleway text-sm font-bold text-heading-deep">{name}</p>
          <p className="font-raleway text-lg font-extrabold leading-none text-heading-dark">{formatUsd(item.usd, lang)}</p>
        </div>
        <button
          type="button"
          tabIndex={show ? 0 : -1}
          disabled={soldOut}
          onClick={() => {
            add({ id: item.id, slug, qty: 1 }, item.stock);
            openDrawer();
          }}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-link-blue px-5 font-manrope text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(0,108,159,0.8)] transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-[#b9c4cf] disabled:shadow-none"
        >
          <CartIcon className="size-[18px]" />
          {soldOut ? labels.outOfStock : labels.add}
        </button>
      </div>
    </div>
  );
}
