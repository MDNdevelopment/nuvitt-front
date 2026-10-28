"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ChangeEvent, type ReactNode } from "react";
import { normalizePhone } from "@/lib/admin/validate";
import { placeOrderAction, quoteAction, type CheckoutError, type Quote } from "@/lib/shop/actions/checkout";
import { useCart, useLiveCatalog } from "@/lib/shop/cart";
import { formatBs, formatUsd } from "@/lib/shop/format";
import type { Locale } from "@/lib/i18n";
import { checkAccount, checkAddress, normCedula, paymentOk, type AccountInput, type AddressInput, type FieldErrors, type PaymentInput, type ValidationMessages } from "@/lib/shop/validate";
import { LoginForm, type AccountLabels } from "./AccountForms";
import { btnGhost, btnPrimary, card, Field, Flash, Input } from "./ui";

type MethodLabel = { title: string; desc: string };

export type CheckoutLabels = {
  empty: string; emptyCta: string; address: string; newAddress: string; noAddresses: string; zone: string; free: string; noZones: string;
  coupon: string; couponPlaceholder: string; apply: string; removeCoupon: string; couponApplied: string; summary: string; subtotal: string;
  discount: string; shipping: string; total: string; totalBs: string; rate: string; payment: string; paymentIntro: string; bank: string;
  bankPlaceholder: string; id: string; phone: string; token: string; tokenHint: string; pay: string; paying: string; quoting: string;
  disabledNotice: string; back: string; errors: Record<CheckoutError, string>;
  yourData: string; yourDataIntro: string; haveAccount: string; loginInline: string; loginClose: string;
  methods: { c2p: MethodLabel; transfer: MethodLabel; zelle: MethodLabel };
  c2pIntro: string; transferIntro: string; zelleIntro: string; transferAmount: string; zelleAmount: string; originBank: string;
  reference: string; referenceHintTransfer: string; referenceHintZelle: string; payerName: string; copy: string; copied: string;
  manualNotice: string; confirmOrder: string; confirming: string;
};

type Method = "c2p" | "transfer" | "zelle";

type Props = {
  lang: Locale;
  labels: CheckoutLabels;
  account: AccountLabels;
  accountErrors: ValidationMessages;
  /** null = invitado: se le pide crear la cuenta en este mismo formulario. */
  user: { name: string; email: string; phone: string; cedula: string } | null;
  addresses: { id: string; label: string; recipient: string; phone: string; line: string; city: string; state: string }[];
  zones: { id: string; name: string; price: number }[];
  banks: { code: string; name: string }[];
  methods: { c2p: boolean; transfer: string | null; zelle: string | null };
  hrefs: { cart: string; products: string; thanks: string; checkout: string };
};

type QuoteState = { key: string; quote: Quote | null; error: CheckoutError | null };

const NEW = "new";
/** Tras crear la cuenta y fallar la compra: "la primera dirección guardada" (la que acabamos de crear). */
const JUST_SAVED = "just-saved";

const emptyAccount: AccountInput = { name: "", email: "", phone: "", cedula: "", password: "", passwordConfirm: "" };
const selectClass = "w-full rounded-md border border-[#d7dee6] bg-white px-4 py-[11px] text-base text-secondary outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/15 aria-[invalid=true]:border-[#c62828]";

export default function CheckoutView({ lang, labels: t, account: accLabels, accountErrors, user, addresses, zones, banks, methods, hrefs }: Props) {
  const router = useRouter();
  const { lines, clear } = useCart();
  const live = useLiveCatalog();
  const ready = !!live?.enabled;
  const f = accLabels.fields;

  const available = (["c2p", "transfer", "zelle"] as const).filter((m) => (m === "c2p" ? methods.c2p : !!methods[m]));
  const guest = !user;

  // Cuenta (solo invitado)
  const [acc, setAcc] = useState<AccountInput>(emptyAccount);
  const [showLogin, setShowLogin] = useState(false);
  const setA = (k: keyof AccountInput) => (e: ChangeEvent<HTMLInputElement>) => setAcc((p) => ({ ...p, [k]: e.target.value }));

  // Dirección: una guardada o una nueva (la que escriba aquí se guarda en su libreta al comprar)
  const [addressSel, setAddressSel] = useState(addresses[0]?.id ?? NEW);
  const addressId = addressSel === JUST_SAVED ? (addresses[0]?.id ?? NEW) : addressSel;
  const [addr, setAddr] = useState<Partial<AddressInput>>({});
  const newAddr: AddressInput = {
    label: addr.label ?? "",
    recipient: addr.recipient ?? (user?.name || acc.name),
    phone: addr.phone ?? (user?.phone || acc.phone),
    state: addr.state ?? "",
    city: addr.city ?? "",
    line: addr.line ?? "",
    reference: addr.reference ?? "",
  };
  const setD = (k: keyof AddressInput) => (e: ChangeEvent<HTMLInputElement>) => setAddr((p) => ({ ...p, [k]: e.target.value }));

  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState(false);

  // Pago
  const [method, setMethod] = useState<Method | undefined>(undefined);
  const payMethod: Method | undefined = method && available.includes(method) ? method : available[0];
  const [c2pBank, setC2pBank] = useState("");
  const [payIdIn, setPayIdIn] = useState<string>();
  const [payPhoneIn, setPayPhoneIn] = useState<string>();
  const [payToken, setPayToken] = useState("");
  const [tBank, setTBank] = useState("");
  const [tRef, setTRef] = useState("");
  const [zRef, setZRef] = useState("");
  const [zNameIn, setZNameIn] = useState<string>();
  const payId = payIdIn ?? (user?.cedula || acc.cedula);
  const payPhone = payPhoneIn ?? (user?.phone || acc.phone);
  const zName = zNameIn ?? (user?.name || acc.name);

  // Tras el primer intento de envío los errores se recalculan en vivo, así desaparecen al corregir cada campo.
  const [submitted, setSubmitted] = useState(false);
  const [takenEmail, setTakenEmail] = useState<string | null>(null);
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
  const canSubmit = !!payMethod && !!quote && !quoting && !paying && !!zoneId;

  const buildPayment = (m: Method): PaymentInput =>
    m === "c2p" ? { method: "c2p", bank: c2pBank, id: normCedula(payId), phone: payPhone, token: payToken }
    : m === "transfer" ? { method: "transfer", bank: tBank, reference: tRef }
    : { method: "zelle", reference: zRef, payerName: zName };

  const errors = {
    account: guest ? checkAccount(acc, accountErrors) : {},
    address: addressId === NEW ? checkAddress(newAddr, accountErrors) : {},
    payment: !!payMethod && !paymentOk(buildPayment(payMethod)),
  };
  const hasErrors = Object.keys(errors.account).length > 0 || Object.keys(errors.address).length > 0 || errors.payment;

  const focusFirstError = () =>
    setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.scrollIntoView({ block: "center", behavior: "smooth" }), 0);

  const onSubmit = () => {
    if (!payMethod) return;
    setPayError(null);
    setSubmitted(true);
    if (hasErrors) {
      setPayError(t.errors.fields);
      focusFirstError();
      return;
    }
    const payment = buildPayment(payMethod);

    startPaying(async () => {
      const r = await placeOrderAction(lang, {
        items,
        zone: zoneId,
        coupon,
        address: addressId === NEW ? { fields: newAddr } : { id: addressId },
        account: guest ? acc : undefined,
        payment,
      });
      if (r.ok) {
        clear();
        router.push(`${hrefs.thanks}?orden=${r.number}`);
        return;
      }
      setPayError(r.message ?? t.errors[r.error]);
      if (r.error === "emailTaken") {
        setTakenEmail(acc.email);
        setShowLogin(true);
      }
      if (r.accountCreated) {
        // La cuenta ya existe: se recarga la página con sesión, y la dirección recién guardada queda seleccionada.
        if (addressId === NEW) setAddressSel(JUST_SAVED);
        router.refresh();
      }
      if (r.error === "emailTaken" || r.error === "fields") focusFirstError();
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

  const n = guest ? { address: 2, zone: 3, payment: 4 } : { address: 1, zone: 2, payment: 3 };
  const show = submitted;
  const ea: FieldErrors = show ? { ...errors.account } : {};
  if (takenEmail !== null && takenEmail === acc.email) ea.email = accountErrors.emailTaken;
  const ed: FieldErrors = show ? errors.address : {};
  const payErr = show && errors.payment ? t.errors.payment : undefined;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {guest && (
          <section className={card}>
            <Title n={1}>{t.yourData}</Title>
            <p className="mb-4 text-sm text-body">
              {t.yourDataIntro} {t.haveAccount}{" "}
              <button type="button" onClick={() => setShowLogin((v) => !v)} aria-expanded={showLogin} className="font-semibold text-link-blue underline">
                {showLogin ? t.loginClose : t.loginInline}
              </button>
            </p>
            {showLogin && (
              <div className="mb-5 rounded-lg border border-[#dce6f1] bg-product-bg/40 p-4">
                <LoginForm lang={lang} labels={accLabels} next={hrefs.checkout} />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label={f.name} htmlFor="ck-name" error={ea.name}>
                  <Input id="ck-name" value={acc.name} onChange={setA("name")} autoComplete="name" error={ea.name} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label={f.email} htmlFor="ck-email" error={ea.email}>
                  <Input id="ck-email" type="email" value={acc.email} onChange={setA("email")} autoComplete="email" error={ea.email} />
                </Field>
              </div>
              <Field label={f.phone} htmlFor="ck-phone" hint={f.phoneHint} error={ea.phone}>
                <Input id="ck-phone" type="tel" value={acc.phone} onChange={setA("phone")} autoComplete="tel" error={ea.phone} />
              </Field>
              <Field label={f.cedula} htmlFor="ck-cedula" hint={f.cedulaHint} error={ea.cedula}>
                <Input id="ck-cedula" value={acc.cedula} onChange={setA("cedula")} autoComplete="off" error={ea.cedula} />
              </Field>
              <Field label={f.password} htmlFor="ck-password" hint={f.passwordHint} error={ea.password}>
                <Input id="ck-password" type="password" value={acc.password} onChange={setA("password")} autoComplete="new-password" error={ea.password} />
              </Field>
              <Field label={f.passwordConfirm} htmlFor="ck-confirm" error={ea.passwordConfirm}>
                <Input id="ck-confirm" type="password" value={acc.passwordConfirm} onChange={setA("passwordConfirm")} autoComplete="new-password" error={ea.passwordConfirm} />
              </Field>
            </div>
          </section>
        )}

        <section className={card}>
          <Title n={n.address}>{t.address}</Title>
          {addresses.length > 0 && (
            <div role="radiogroup" aria-label={t.address} className="space-y-3">
              {addresses.map((a) => (
                <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${addressId === a.id ? "border-primary-dark bg-product-bg/50" : "border-[#dce6f1]"}`}>
                  <input type="radio" name="address" value={a.id} checked={addressId === a.id} onChange={() => setAddressSel(a.id)} className="mt-1 accent-primary-dark" />
                  <span className="text-sm text-secondary">
                    {a.label && <strong className="block font-raleway text-base text-heading-deep">{a.label}</strong>}
                    {a.recipient} · {a.phone}
                    <br />
                    {a.line}, {a.city}, {a.state}
                  </span>
                </label>
              ))}
              <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${addressId === NEW ? "border-primary-dark bg-product-bg/50" : "border-[#dce6f1]"}`}>
                <input type="radio" name="address" value={NEW} checked={addressId === NEW} onChange={() => setAddressSel(NEW)} className="accent-primary-dark" />
                <span className="text-sm font-semibold text-ink">{t.newAddress}</span>
              </label>
            </div>
          )}
          {addressId === NEW && (
            <div className={`grid gap-4 sm:grid-cols-2 ${addresses.length > 0 ? "mt-4" : ""}`}>
              <Field label={f.recipient} htmlFor="ck-recipient" error={ed.recipient}>
                <Input id="ck-recipient" value={newAddr.recipient} onChange={setD("recipient")} autoComplete="name" error={ed.recipient} />
              </Field>
              <Field label={f.phone} htmlFor="ck-addr-phone" hint={f.phoneHint} error={ed.phone}>
                <Input id="ck-addr-phone" type="tel" value={newAddr.phone} onChange={setD("phone")} autoComplete="tel" error={ed.phone} />
              </Field>
              <Field label={f.state} htmlFor="ck-state" error={ed.state}>
                <Input id="ck-state" value={newAddr.state} onChange={setD("state")} autoComplete="address-level1" error={ed.state} />
              </Field>
              <Field label={f.city} htmlFor="ck-city" error={ed.city}>
                <Input id="ck-city" value={newAddr.city} onChange={setD("city")} autoComplete="address-level2" error={ed.city} />
              </Field>
              <div className="sm:col-span-2">
                <Field label={f.line} htmlFor="ck-line" error={ed.line}>
                  <Input id="ck-line" value={newAddr.line} onChange={setD("line")} autoComplete="street-address" error={ed.line} />
                </Field>
              </div>
              <Field label={f.reference} htmlFor="ck-reference">
                <Input id="ck-reference" value={newAddr.reference} onChange={setD("reference")} />
              </Field>
              <Field label={f.label} htmlFor="ck-label" hint={f.labelHint}>
                <Input id="ck-label" maxLength={60} value={newAddr.label} onChange={setD("label")} />
              </Field>
            </div>
          )}
          {addresses.length === 0 && !guest && <p className="sr-only">{t.noAddresses}</p>}
        </section>

        <section className={card}>
          <Title n={n.zone}>{t.zone}</Title>
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
          <Title n={n.payment}>{t.payment}</Title>
          {available.length === 0 ? (
            <p className="text-body">{t.disabledNotice}</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-body">{t.paymentIntro}</p>
              <div role="radiogroup" aria-label={t.payment} className="space-y-3">
                {available.map((m) => (
                  <label key={m} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${payMethod === m ? "border-primary-dark bg-product-bg/50" : "border-[#dce6f1]"}`}>
                    <input type="radio" name="method" value={m} checked={payMethod === m} onChange={() => setMethod(m)} className="mt-1 accent-primary-dark" />
                    <span>
                      <span className="block font-semibold text-ink">{t.methods[m].title}</span>
                      <span className="block text-sm text-secondary">{t.methods[m].desc}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-5">
                {payMethod === "c2p" && (
                  <>
                    <p className="mb-4 text-sm text-body">{t.c2pIntro}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t.bank} htmlFor="pay-bank">
                        <BankSelect id="pay-bank" value={c2pBank} onChange={setC2pBank} banks={banks} placeholder={t.bankPlaceholder} invalid={!!payErr && !/^\d{4}$/.test(c2pBank)} />
                      </Field>
                      <Field label={t.id} htmlFor="pay-id">
                        <Input id="pay-id" value={payId} onChange={(e) => setPayIdIn(e.target.value)} placeholder="V12345678" autoComplete="off" error={payErr && !/^[VEJGP]\d{5,10}$/.test(normCedula(payId)) ? payErr : undefined} />
                      </Field>
                      <Field label={t.phone} htmlFor="pay-phone">
                        <Input id="pay-phone" type="tel" value={payPhone} onChange={(e) => setPayPhoneIn(e.target.value)} placeholder="0412 123 4567" autoComplete="tel" error={payErr && !normalizePhone(payPhone) ? payErr : undefined} />
                      </Field>
                      <Field label={t.token} htmlFor="pay-token" hint={t.tokenHint}>
                        <Input id="pay-token" inputMode="numeric" value={payToken} onChange={(e) => setPayToken(e.target.value.replace(/\D/g, "").slice(0, 12))} autoComplete="one-time-code" error={payErr && !/^\d{8,12}$/.test(payToken) ? payErr : undefined} />
                      </Field>
                    </div>
                  </>
                )}

                {payMethod === "transfer" && (
                  <>
                    <p className="mb-3 text-sm text-body">{t.transferIntro}</p>
                    <Instructions details={methods.transfer ?? ""} amountLabel={t.transferAmount} amount={quote ? formatBs(quote.total_bs, lang) : "…"} copy={t.copy} copied={t.copied} />
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label={t.originBank} htmlFor="tr-bank">
                        <BankSelect id="tr-bank" value={tBank} onChange={setTBank} banks={banks} placeholder={t.bankPlaceholder} invalid={!!payErr && !/^\d{4}$/.test(tBank)} />
                      </Field>
                      <Field label={t.reference} htmlFor="tr-ref" hint={t.referenceHintTransfer}>
                        <Input id="tr-ref" inputMode="numeric" value={tRef} onChange={(e) => setTRef(e.target.value.replace(/\D/g, "").slice(0, 20))} autoComplete="off" error={payErr && !/^\d{6,20}$/.test(tRef) ? payErr : undefined} />
                      </Field>
                    </div>
                  </>
                )}

                {payMethod === "zelle" && (
                  <>
                    <p className="mb-3 text-sm text-body">{t.zelleIntro}</p>
                    <Instructions details={methods.zelle ?? ""} amountLabel={t.zelleAmount} amount={quote ? formatUsd(quote.total_usd, lang) : "…"} copy={t.copy} copied={t.copied} />
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label={t.payerName} htmlFor="ze-name">
                        <Input id="ze-name" value={zName} onChange={(e) => setZNameIn(e.target.value)} autoComplete="name" error={payErr && zName.trim().length < 2 ? payErr : undefined} />
                      </Field>
                      <Field label={t.reference} htmlFor="ze-ref" hint={t.referenceHintZelle}>
                        <Input id="ze-ref" value={zRef} onChange={(e) => setZRef(e.target.value.slice(0, 40))} autoComplete="off" error={payErr && zRef.trim().length < 4 ? payErr : undefined} />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
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
            {current?.error ? t.errors[current.error] : zones.length === 0 ? t.noZones : t.quoting}
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
          {payError && !(payError === t.errors.fields && !hasErrors) && <Flash message={payError} />}
          <button type="button" onClick={onSubmit} disabled={!canSubmit} className={`${btnPrimary} w-full ${!canSubmit ? "!cursor-not-allowed !bg-[#b9c4cf] opacity-100" : ""}`}>
            {paying
              ? payMethod === "c2p" ? t.paying : t.confirming
              : payMethod === "c2p" ? t.pay.replace("{amount}", quote ? formatBs(quote.total_bs, lang) : "") : t.confirmOrder}
          </button>
          {payMethod && payMethod !== "c2p" && <p className="text-center text-xs text-body">{t.manualNotice}</p>}
          {available.length === 0 && <p className="text-center text-xs text-body">{t.disabledNotice}</p>}
          <Link href={hrefs.cart} className="block text-center text-sm font-semibold text-link-blue hover:underline">
            {t.back}
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Title({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 font-raleway text-xl font-bold text-heading-dark">
      <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-dark text-sm font-bold text-white">
        {n}
      </span>
      {children}
    </h2>
  );
}

function BankSelect({ id, value, onChange, banks, placeholder, invalid }: { id: string; value: string; onChange: (v: string) => void; banks: { code: string; name: string }[]; placeholder: string; invalid?: boolean }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid || undefined} className={selectClass}>
      <option value="">{placeholder}</option>
      {banks.map((b) => (
        <option key={b.code} value={b.code}>
          {b.code} · {b.name}
        </option>
      ))}
    </select>
  );
}

/** Datos de la cuenta donde pagar (los define el admin) y el monto exacto a pagar. */
function Instructions({ details, amountLabel, amount, copy, copied }: { details: string; amountLabel: string; amount: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(details);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* sin portapapeles: el texto sigue visible para copiarlo a mano */
    }
  };
  return (
    <div className="rounded-lg border border-[#dce6f1] bg-product-bg/50 p-4">
      <pre className="whitespace-pre-wrap break-words font-manrope text-sm text-ink">{details}</pre>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#dce6f1] pt-3">
        <p className="text-sm text-body">
          {amountLabel}: <strong className="font-raleway text-base text-heading-dark">{amount}</strong>
        </p>
        <button type="button" onClick={onCopy} className={btnGhost}>
          {done ? copied : copy}
        </button>
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
