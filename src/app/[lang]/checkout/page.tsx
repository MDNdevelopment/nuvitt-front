import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CheckoutSteps from "@/components/shop/CheckoutSteps";
import CheckoutView from "@/components/shop/CheckoutView";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { BANKS } from "@/lib/shop/banks";
import { listActiveZones, listAddresses, paymentConfig } from "@/lib/shop/data";
import { accountLabels } from "@/lib/shop/labels";
import { getCustomer } from "@/lib/shop/session";
import { SHOP_ENABLED } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "/checkout/", title: dict.checkout.meta.title, description: dict.checkout.meta.description, noindex: true });
}

export default async function CheckoutPage({ params }: PageProps<"/[lang]/checkout">) {
  const { lang } = await params;
  if (!hasLocale(lang) || !SHOP_ENABLED) notFound();
  // Sin sesión también se entra: el invitado crea su cuenta en este mismo formulario.
  const session = await getCustomer();

  const dict = await getDictionary(lang);
  const c = dict.checkout;
  const [addresses, zones, payments] = await Promise.all([
    session ? listAddresses(session.token) : Promise.resolve([]),
    listActiveZones(session?.token),
    paymentConfig(),
  ]);

  return (
    <section className="py-10 min-[1025px]:py-[70px]">
      <div className="container-nv">
        <CheckoutSteps current={2} labels={dict.cart.steps} />
        <h1 className="mb-8 font-raleway text-[36px] font-bold leading-none text-heading-dark min-[1025px]:text-[44px]">{c.title}</h1>
        <CheckoutView
          lang={lang}
          account={accountLabels(dict)}
          accountErrors={dict.account.errors}
          user={session ? { name: session.user.name, email: session.user.email, phone: session.user.phone, cedula: session.user.cedula } : null}
          addresses={addresses}
          zones={zones.map((z) => ({ id: z.id, name: lang === "es" ? z.name_es : z.name_en, price: z.price_usd }))}
          banks={BANKS}
          methods={payments.methods}
          hrefs={{
            cart: localePath(lang, "/carrito/"),
            products: localePath(lang, "/productos/"),
            thanks: localePath(lang, "/checkout/gracias/"),
            checkout: localePath(lang, "/checkout/"),
          }}
          labels={{
            empty: c.empty, emptyCta: c.emptyCta, address: c.address, newAddress: c.newAddress, noAddresses: c.noAddresses, zone: c.zone,
            free: c.free, noZones: c.noZones, coupon: c.coupon, couponPlaceholder: c.couponPlaceholder, apply: c.apply,
            removeCoupon: c.removeCoupon, couponApplied: c.couponApplied, summary: c.summary, subtotal: c.subtotal, discount: c.discount,
            shipping: c.shipping, total: c.total, totalBs: c.totalBs, rate: c.rate, payment: c.payment, paymentIntro: c.paymentIntro,
            bank: c.bank, bankPlaceholder: c.bankPlaceholder, id: c.id, phone: c.phone, token: c.token, tokenHint: c.tokenHint,
            pay: c.pay, paying: c.paying, quoting: c.quoting, disabledNotice: c.disabledNotice, back: c.back,
            errors: c.errors,
            yourData: c.yourData, yourDataIntro: c.yourDataIntro, haveAccount: c.haveAccount, loginInline: c.loginInline, loginClose: c.loginClose,
            methods: c.methods, c2pIntro: c.c2pIntro, transferIntro: c.transferIntro, zelleIntro: c.zelleIntro,
            transferAmount: c.transferAmount, zelleAmount: c.zelleAmount, originBank: c.originBank, reference: c.reference,
            referenceHintTransfer: c.referenceHintTransfer, referenceHintZelle: c.referenceHintZelle, payerName: c.payerName,
            copy: c.copy, copied: c.copied, manualNotice: c.manualNotice, confirmOrder: c.confirmOrder, confirming: c.confirming,
          }}
        />
      </div>
    </section>
  );
}
