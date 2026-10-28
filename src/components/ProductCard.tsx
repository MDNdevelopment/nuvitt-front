import Image from "next/image";
import Link from "next/link";
import { ArrowRightSolidIcon } from "./icons";
import CardBuy, { type CardOffer } from "./shop/CardBuy";
import type { Product } from "@/data/products";
import { localePath, type Locale } from "@/lib/i18n";
import type { BuyLabels } from "@/lib/shop/labels";

type Props = {
  product: Product;
  lang: Locale;
  viewLabel: string;
  priority?: boolean;
  /** Datos de compra (solo con la tienda encendida y el producto a la venta). */
  offer?: CardOffer;
  labels?: BuyLabels;
};

/** Tarjeta del catálogo: frasco que sobresale de la tarjeta + datos clave + compra rápida. */
export default function ProductCard({ product, lang, viewLabel, priority, offer, labels }: Props) {
  const p = product[lang];
  const href = localePath(lang, `/${product.slug}/`);
  const buy = offer && labels ? <CardBuy lang={lang} slug={product.slug} initial={offer} labels={labels} /> : null;

  return (
    <article className="group relative mt-[66px] flex h-[calc(100%-66px)] flex-col items-center rounded-3xl border border-[#dce6f1] bg-white px-5 pb-6 text-center shadow-[0_10px_28px_-16px_rgba(30,92,130,0.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-18px_rgba(30,92,130,0.4)]">
      <div className="-mt-[66px]">
        <Image {...product.image} alt="" priority={priority} sizes="160px" className="h-[208px] w-auto transition-transform duration-500 group-hover:scale-105" />
      </div>
      <p className="mt-2 font-raleway text-xs font-bold leading-3 text-primary">{p.card.badge}</p>
      <h2 className="mt-3 font-raleway text-[22px] font-bold leading-[22px] text-heading-deep">
        <Link href={href} className="after:absolute after:inset-0 after:content-[''] hover:text-primary">
          {p.name}
        </Link>
      </h2>
      <h3 className="mt-3 font-raleway text-[13px] font-bold uppercase leading-[13px] text-primary">{p.card.tagline}</h3>
      <p className="mt-3 line-clamp-3 min-h-[58.5px] font-montserrat text-[13px] leading-[19.5px] text-[#7c7c7c]">{p.card.desc}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#dce6f1] px-3.5 py-2 font-montserrat text-xs font-semibold leading-3 text-secondary">
        <span>{p.card.spec}</span>
        <span aria-hidden="true" className="text-[10px]">●</span>
        <span>{p.card.count}</span>
      </p>
      <div className="mt-auto w-full pt-5">
        {buy}
        <span
          className={`inline-flex items-center gap-2 font-manrope text-sm font-semibold transition-colors ${buy ? "mt-3 text-link-blue group-hover:text-primary-dark" : "rounded-full bg-primary px-[22px] py-[10px] text-[15px] text-white group-hover:bg-primary-dark"}`}
        >
          {viewLabel}
          <ArrowRightSolidIcon className="size-3.5" />
        </span>
      </div>
    </article>
  );
}
