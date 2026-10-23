import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import CheckoutView from "@/components/shop/CheckoutView";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { BANKS } from "@/lib/shop/banks";
import { listActiveZones, listAddresses, paymentsEnabled } from "@/lib/shop/data";
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
  const session = await getCustomer();
  // Sin sesión: al login/registro de la cuenta y de vuelta aquí.
  if (!session) redirect(`${localePath(lang, "/cuenta/")}?next=${encodeURIComponent(localePath(lang, "/checkout/"))}`);

  const dict = await getDictionary(lang);
  const c = dict.checkout;
  const [addresses, zones, enabled] = await Promise.all([listAddresses(session.token), listActiveZones(session.token), paymentsEnabled()]);
  const checkoutHref = localePath(lang, "/checkout/");

  return (
    <section className="py-10 min-[1025px]:py-[70px]">
      <div className="container-nv">
        <h1 className="mb-8 font-raleway text-[36px] font-bold leading-none text-heading-dark min-[1025px]:text-[44px]">{c.title}</h1>
        <CheckoutView
          lang={lang}
          user={{ phone: session.user.phone, cedula: session.user.cedula }}
          addresses={addresses}
          zones={zones.map((z) => ({ id: z.id, name: lang === "es" ? z.name_es : z.name_en, price: z.price_usd }))}
          banks={BANKS}
          paymentsEnabled={enabled}
          hrefs={{
            cart: localePath(lang, "/carrito/"),
            products: localePath(lang, "/productos/"),
            addAddress: `${localePath(lang, "/cuenta/direcciones/")}?next=${encodeURIComponent(checkoutHref)}`,
            thanks: localePath(lang, "/checkout/gracias/"),
          }}
          labels={{
            empty: c.empty, emptyCta: c.emptyCta, address: c.address, addAddress: c.addAddress, noAddresses: c.noAddresses, zone: c.zone,
            free: c.free, noZones: c.noZones, coupon: c.coupon, couponPlaceholder: c.couponPlaceholder, apply: c.apply,
            removeCoupon: c.removeCoupon, couponApplied: c.couponApplied, summary: c.summary, subtotal: c.subtotal, discount: c.discount,
            shipping: c.shipping, total: c.total, totalBs: c.totalBs, rate: c.rate, payment: c.payment, paymentIntro: c.paymentIntro,
            bank: c.bank, bankPlaceholder: c.bankPlaceholder, id: c.id, phone: c.phone, token: c.token, tokenHint: c.tokenHint,
            pay: c.pay, paying: c.paying, quoting: c.quoting, disabledNotice: c.disabledNotice, back: c.back,
            errors: c.errors,
          }}
        />
      </div>
    </section>
  );
}
