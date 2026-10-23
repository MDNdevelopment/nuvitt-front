"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { payAction, quoteAction, type CheckoutError, type Quote } from "@/lib/shop/actions/checkout";
import { useCart, useLiveCatalog } from "@/lib/shop/cart";
import { formatBs, formatUsd } from "@/lib/shop/format";
import type { Locale } from "@/lib/i18n";
import { btnGhost, btnPrimary, card, Field, Flash, Input } from "./ui";

export type CheckoutLabels = {
  empty: string; emptyCta: string; address: string; addAddress: string; noAddresses: string; zone: string; free: string; noZones: string;
  coupon: string; couponPlaceholder: string; apply: string; removeCoupon: string; couponApplied: string; summary: string; subtotal: string;
  discount: string; shipping: string; total: string; totalBs: string; rate: string; payment: string; paymentIntro: string; bank: string;
  bankPlaceholder: string; id: string; phone: string; token: string; tokenHint: string; pay: string; paying: string; quoting: string;
  disabledNotice: string; back: string; errors: Record<CheckoutError, string>;
};

type Props = {
  lang: Locale;
  labels: CheckoutLabels;
  user: { phone: string; cedula: string };
  addresses: { id: string; label: string; recipient: string; phone: string; line: string; city: string; state: string }[];
  zones: { id: string; name: string; price: number }[];
  banks: { code: string; name: string }[];
  paymentsEnabled: boolean;
  hrefs: { cart: string; products: string; addAddress: string; thanks: string };
};

type QuoteState = { key: string; quote: Quote | null; error: CheckoutError | null };

const ID_RE = /^[VEJGP]\d{5,10}$/;
const phoneOk = (p: string) => {
  const d = p.replace(/\D/g, "").replace(/^0058/, "").replace(/^58/, "").replace(/^0/, "");
  return d.length === 10 && d.startsWith("4");
};

export default function CheckoutView({ lang, labels: t, user, addresses, zones, banks, paymentsEnabled, hrefs }: Props) {
  const router = useRouter();
  const { lines, clear } = useCart();
  const live = useLiveCatalog();
  const ready = !!live?.enabled;

  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [bank, setBank] = useState("");
  const [payId, setPayId] = useState(user.cedula);
  const [payPhone, setPayPhone] = useState(user.phone);
  const [payToken, setPayToken] = useState("");
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, startPaying] = useTransition();

  const items = useMemo(
    () => lines.flatMap((l) => {
      const it = live?.items[l.slug];
      return it && it.stock > 0 ? [{ product: it.id, qty: Math.min(l.qty, it.stock) }] : [];
    }),
    [lines, live],
  );
  const key = JSON.stringify([items, zoneId, coupon]);
  const canQuote = ready && items.length > 0 && !!zoneId;
  const [state, setState] = useState<QuoteState | null>(null);
  const current = state?.key === key ? state : null;
  const quoting = canQuote && !current;

  useEffect(() => {
    if (!canQuote) return;
    let alive = true;
    const timer = setTimeout(async () => {
      const r = await quoteAction(lang, { items, zone: zoneId, coupon });
      if (!alive) return;
      if (r.ok) {
        setState({ key, quote: r.quote, error: null });
        setCouponError(false);
      } else if (r.error === "coupon" && coupon) {
        // El cupón no sirve: se quita y se vuelve a cotizar sin él.
        setCouponError(true);
        setCoupon("");
      } else {
        setState({ key, quote: null, error: r.error });
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [canQuote, key, lang, items, zoneId, coupon]);

  const quote = current?.quote ?? null;
  const idNorm = payId.toUpperCase().replace(/[\s.-]/g, "");
  const formOk = !!addressId && !!zoneId && /^\d{4}$/.test(bank) && ID_RE.test(idNorm) && phoneOk(payPhone) && /^\d{8,12}$/.test(payToken);
  const canPay = paymentsEnabled && !!quote && !quoting && !paying && formOk;

  const onPay = () => {
    setPayError(null);
    startPaying(async () => {
      const r = await payAction(lang, { items, zone: zoneId, address: addressId, coupon, payment: { bank, id: idNorm, phone: payPhone, token: payToken } });
      if (r.ok) {
        clear();
        router.push(`${hrefs.thanks}?orden=${r.number}`);
      } else {
        setPayError(r.message ?? t.errors[r.error]);
      }
    });
  };

  if (lines.length === 0 || (ready && items.length === 0)) {
    return (
      <div className={`${card} py-12 text-center`}>
        <p className="font-raleway text-xl font-semibold text-heading-dark">{t.empty}</p>
        <Link href={hrefs.products} className="mt-6 inline-block rounded bg-link-blue px-7 py-[15px] font-manrope text-base font-semibold text-white transition-colors hover:bg-primary-dark">
          {t.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className={card}>
          <h2 className="mb-4 font-raleway text-xl font-bold text-heading-dark">{t.address}</h2>
          {addresses.length === 0 ? (
            <p className="mb-4 text-body">{t.noAddresses}</p>
          ) : (
            <div role="radiogroup" aria-label={t.address} className="space-y-3">
              {addresses.map((a) => (
                <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${addressId === a.id ? "border-primary-dark bg-product-bg/50" : "border-[#dce6f1]"}`}>
                  <input type="radio" name="address" value={a.id} checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 accent-primary-dark" />
                  <span className="text-sm text-secondary">
                    {a.label && <strong className="block font-raleway text-base text-heading-deep">{a.label}</strong>}
                    {a.recipient} · {a.phone}
                    <br />
                    {a.line}, {a.city}, {a.state}
                  </span>
                </label>
              ))}
            </div>
          )}
          <Link href={hrefs.addAddress} className={`${btnGhost} mt-4`}>
            + {t.addAddress}
          </Link>
        </section>

        <section className={card}>
          <h2 className="mb-4 font-raleway text-xl font-bold text-heading-dark">{t.zone}</h2>
          {zones.length === 0 ? (
            <p className="text-body">{t.noZones}</p>
          ) : (
            <div role="radiogroup" aria-label={t.zone} className="space-y-3">
              {zones.map((z) => (
                <label key={z.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 ${zoneId === z.id ? "border-primary-dark bg-product-bg/50" : "border-[#dce6f1]"}`}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="zone" value={z.id} checked={zoneId === z.id} onChange={() => setZoneId(z.id)} className="accent-primary-dark" />
                    <span className="font-semibold text-ink">{z.name}</span>
                  </span>
                  <span className="text-sm font-semibold text-heading-dark">{z.price > 0 ? formatUsd(z.price, lang) : t.free}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-1 font-raleway text-xl font-bold text-heading-dark">{t.payment}</h2>
          <p className="mb-4 text-sm text-body">{t.paymentIntro}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.bank} htmlFor="pay-bank">
              <select id="pay-bank" value={bank} onChange={(e) => setBank(e.target.value)} className="w-full rounded-md border border-[#d7dee6] bg-white px-4 py-[11px] text-base text-secondary outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/15">
                <option value="">{t.bankPlaceholder}</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} · {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t.id} htmlFor="pay-id">
              <Input id="pay-id" value={payId} onChange={(e) => setPayId(e.target.value)} placeholder="V12345678" autoComplete="off" />
            </Field>
            <Field label={t.phone} htmlFor="pay-phone">
              <Input id="pay-phone" type="tel" value={payPhone} onChange={(e) => setPayPhone(e.target.value)} placeholder="0412 123 4567" autoComplete="tel" />
            </Field>
            <Field label={t.token} htmlFor="pay-token" hint={t.tokenHint}>
              <Input id="pay-token" inputMode="numeric" value={payToken} onChange={(e) => setPayToken(e.target.value.replace(/\D/g, "").slice(0, 12))} autoComplete="one-time-code" />
            </Field>
          </div>
        </section>
      </div>

      <aside className={`${card} lg:sticky lg:top-[110px]`}>
        <h2 className="mb-4 font-raleway text-xl font-bold text-heading-dark">{t.summary}</h2>
        {quote ? (
          <>
            <ul className="mb-4 space-y-2 border-b border-[#e8eef5] pb-4 text-sm">
              {quote.items.map((it) => (
                <li key={it.slug} className="flex justify-between gap-3">
                  <span className="text-secondary">
                    {lang === "es" ? it.name_es : it.name_en} × {it.qty}
                  </span>
                  <span className="font-semibold text-ink">{formatUsd(it.price_usd * it.qty, lang)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 text-sm">
              <Row label={t.subtotal} value={formatUsd(quote.subtotal_usd, lang)} />
              {quote.discount_usd > 0 && <Row label={`${t.discount} (${coupon})`} value={`− ${formatUsd(quote.discount_usd, lang)}`} />}
              <Row label={t.shipping} value={quote.shipping_usd > 0 ? formatUsd(quote.shipping_usd, lang) : t.free} />
              <div className="border-t border-[#e8eef5] pt-2">
                <Row label={t.total} value={formatUsd(quote.total_usd, lang)} strong />
              </div>
              <Row label={t.rate} value={`Bs ${quote.rate.toLocaleString(lang === "es" ? "es-VE" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`} />
              <Row label={t.totalBs} value={formatBs(quote.total_bs, lang)} strong />
            </dl>
          </>
        ) : (
          <p className="text-sm text-body" aria-live="polite">
            {current?.error ? t.errors[current.error] : t.quoting}
          </p>
        )}

        <div className="mt-5 border-t border-[#e8eef5] pt-4">
          <label htmlFor="coupon" className="mb-2 block text-sm font-semibold text-ink">
            {t.coupon}
          </label>
          {coupon ? (
            <p className="flex items-center justify-between rounded-md bg-[#e8f5e9] px-3 py-2 text-sm font-medium text-[#2e7d32]">
              {t.couponApplied}: {coupon}
              <button type="button" onClick={() => { setCoupon(""); setCouponInput(""); }} className="underline">
                {t.removeCoupon}
              </button>
            </p>
          ) : (
            <div className="flex gap-2">
              <Input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder={t.couponPlaceholder} autoComplete="off" />
              <button type="button" onClick={() => { setCouponError(false); setCoupon(couponInput.trim()); }} disabled={!couponInput.trim()} className={`${btnGhost} disabled:opacity-50`}>
                {t.apply}
              </button>
            </div>
          )}
          {couponError && <p role="alert" className="mt-1 text-xs font-medium text-[#c62828]">{t.errors.coupon}</p>}
        </div>

        <div className="mt-5 space-y-3">
          {payError && <Flash message={payError} />}
          <button type="button" onClick={onPay} disabled={!canPay} className={`${btnPrimary} w-full ${!canPay ? "!cursor-not-allowed !bg-[#b9c4cf] opacity-100" : ""}`}>
            {paying ? t.paying : quote ? t.pay.replace("{amount}", formatBs(quote.total_bs, lang)) : t.pay.replace("{amount}", "")}
          </button>
          {!paymentsEnabled && <p className="text-center text-xs text-body">{t.disabledNotice}</p>}
          <Link href={hrefs.cart} className="block text-center text-sm font-semibold text-link-blue hover:underline">
            {t.back}
          </Link>
        </div>
      </aside>
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
