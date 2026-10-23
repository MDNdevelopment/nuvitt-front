import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btnGhost, card } from "@/components/shop/ui";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { getOrderByNumber } from "@/lib/shop/data";
import { formatBs, formatUsd } from "@/lib/shop/format";
import { requireCustomer } from "@/lib/shop/session";
import { SHOP_ENABLED } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout/gracias">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "/checkout/gracias/", title: dict.thanks.meta.title, description: dict.checkout.meta.description, noindex: true });
}

export default async function ThanksPage({ params, searchParams }: PageProps<"/[lang]/checkout/gracias">) {
  const { lang } = await params;
  const { orden } = await searchParams;
  if (!hasLocale(lang) || !SHOP_ENABLED || typeof orden !== "string" || !/^\d{1,9}$/.test(orden)) notFound();
  const { token } = await requireCustomer(lang);
  // Las reglas de PocketBase solo devuelven pedidos del propio cliente.
  const order = await getOrderByNumber(token, Number(orden));
  if (!order) notFound();

  const dict = await getDictionary(lang);
  const t = dict.thanks;
  const verifying = order.status === "por_verificar";

  return (
    <section className="py-12 min-[1025px]:py-[90px]">
      <div className="container-nv">
        <div className={`${card} mx-auto max-w-[620px] text-center`}>
          <span aria-hidden className={`mx-auto mb-5 grid size-16 place-items-center rounded-full text-3xl text-white ${verifying ? "bg-[#e0a030]" : "bg-accent"}`}>
            {verifying ? "…" : "✓"}
          </span>
          <h1 className="font-raleway text-[32px] font-bold leading-tight text-heading-dark">{verifying ? t.titleVerifying : t.titlePaid}</h1>
          <p className="mt-3 text-secondary">{verifying ? t.textVerifying : t.textPaid}</p>
          <div className="mt-6 rounded-lg bg-product-bg/50 p-4 text-left text-sm">
            <p className="font-raleway text-lg font-bold text-heading-deep">{t.order.replace("{n}", String(order.number))}</p>
            <ul className="mt-2 space-y-1 text-secondary">
              {order.items.map((it) => (
                <li key={it.product} className="flex justify-between gap-3">
                  <span>
                    {lang === "es" ? it.name_es : it.name_en} × {it.qty}
                  </span>
                  <span>{formatUsd(it.price_usd * it.qty, lang)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between border-t border-[#dce6f1] pt-3 font-semibold text-ink">
              <span>{formatUsd(order.total_usd, lang)}</span>
              <span>{formatBs(order.total_bs, lang)}</span>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={localePath(lang, `/cuenta/pedidos/${order.number}/`)} className="rounded bg-primary-dark px-6 py-[13px] font-manrope text-base font-semibold text-white transition-colors hover:bg-primary">
              {t.viewOrder}
            </Link>
            <Link href={localePath(lang, "/productos/")} className={btnGhost}>
              {t.continue}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
