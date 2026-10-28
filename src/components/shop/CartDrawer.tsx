"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { closeDrawer, useCart, useDrawerOpen, useLiveCatalog } from "@/lib/shop/cart";
import { formatBs, formatUsd, usdToBs } from "@/lib/shop/format";
import type { Locale } from "@/lib/i18n";
import type { CartMeta } from "./CartView";
import { BagIcon, CloseIcon, TrashIcon } from "./icons";
import QtyStepper from "./QtyStepper";

export type DrawerLabels = {
  title: string;
  close: string;
  empty: string;
  viewCart: string;
  checkout: string;
  subtotal: string;
  continue: string;
  remove: string;
  quantity: string;
  increase: string;
  decrease: string;
};

type Props = { lang: Locale; meta: CartMeta; labels: DrawerLabels; hrefs: { cart: string; checkout: string } };

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Panel lateral del carrito: se abre al agregar un producto. */
export default function CartDrawer({ lang, meta, labels, hrefs }: Props) {
  const open = useDrawerOpen();
  const { lines, setQty, remove } = useCart();
  const live = useLiveCatalog();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return closeDrawer();
      if (e.key !== "Tab" || !panel.current) return;
      const nodes = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener.current?.focus?.();
    };
  }, [open]);

  const ready = !!live?.enabled;
  const rate = live?.rate ?? 0;
  const priced = lines.map((l) => ({ line: l, item: live?.items[l.slug] }));
  const subtotal = priced.reduce((sum, p) => (p.item ? sum + p.item.price_usd * p.line.qty : sum), 0);

  return (
    <div className={`fixed inset-0 z-[90] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={closeDrawer} className={`absolute inset-0 bg-[#10283a]/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        inert={!open}
        className={`absolute right-0 top-0 flex h-full w-[min(100%,420px)] flex-col bg-white shadow-[-20px_0_50px_-20px_rgba(16,40,58,0.45)] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-[#e6edf3] px-6 py-5">
          <h2 className="flex items-center gap-2.5 font-raleway text-xl font-bold text-heading-dark">
            <BagIcon className="size-6 text-link-blue" />
            {labels.title}
          </h2>
          <button ref={closeBtn} type="button" onClick={closeDrawer} aria-label={labels.close} className="grid size-10 place-items-center rounded-full text-slate transition-colors hover:bg-product-bg hover:text-ink">
            <CloseIcon className="size-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="grid flex-1 place-items-center px-8 text-center">
            <div>
              <span className="mx-auto grid size-20 place-items-center rounded-full bg-product-bg text-link-blue">
                <BagIcon className="size-9" />
              </span>
              <p className="mt-5 font-raleway text-lg font-semibold text-heading-dark">{labels.empty}</p>
              <button type="button" onClick={closeDrawer} className="mt-5 font-manrope text-sm font-semibold text-link-blue hover:underline">
                {labels.continue}
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {priced.map(({ line, item }) => {
                const m = meta[line.slug];
                const max = Math.max(1, Math.min(99, item?.stock ?? 99));
                return (
                  <li key={line.id} className="flex gap-4">
                    <Link href={m?.href ?? "#"} onClick={closeDrawer} className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-2xl" style={{ background: m?.tint ?? "#d8e9f3" }}>
                      {m && <Image src={m.src} width={m.width} height={m.height} alt="" sizes="64px" className="h-[70px] w-auto" />}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-raleway text-[15px] font-bold leading-tight text-heading-deep">{m?.name ?? line.slug}</p>
                        <button type="button" onClick={() => remove(line.id)} aria-label={`${labels.remove}: ${m?.name ?? line.slug}`} className="shrink-0 text-slate transition-colors hover:text-[#c62828]">
                          <TrashIcon className="size-[18px]" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <QtyStepper size="sm" value={line.qty} max={max} onChange={(n) => setQty(line.id, n)} labels={labels} />
                        {item && <p className="font-raleway text-base font-bold text-heading-dark">{formatUsd(item.price_usd * line.qty, lang)}</p>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-[#e6edf3] bg-gradient-to-b from-white to-[#eef5fa] px-6 pb-6 pt-5">
              <div className="flex items-baseline justify-between">
                <span className="font-manrope text-sm font-semibold text-secondary">{labels.subtotal}</span>
                <span className="font-raleway text-2xl font-extrabold text-heading-dark">{ready ? formatUsd(subtotal, lang) : "—"}</span>
              </div>
              {ready && rate > 0 && <p className="mt-0.5 text-right text-xs font-medium text-secondary">≈ {formatBs(usdToBs(subtotal, rate), lang)}</p>}
              <Link href={hrefs.checkout} onClick={closeDrawer} className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-link-blue to-primary-dark font-manrope text-base font-bold text-white shadow-[0_10px_22px_-8px_rgba(0,108,159,0.7)] transition hover:-translate-y-0.5">
                {labels.checkout}
              </Link>
              <Link href={hrefs.cart} onClick={closeDrawer} className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-primary-light2 bg-white font-manrope text-[15px] font-semibold text-link-blue transition-colors hover:bg-product-bg">
                {labels.viewCart}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
