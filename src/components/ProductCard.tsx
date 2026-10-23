import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightSolidIcon } from "./icons";
import type { Product } from "@/data/products";
import { localePath, type Locale } from "@/lib/i18n";

type Props = {
  product: Product;
  lang: Locale;
  viewLabel: string;
  priority?: boolean;
  /** Precio + botón de compra (solo con la tienda encendida). */
  buy?: ReactNode;
};

/** Tarjeta del catálogo: frasco que sobresale de la tarjeta + datos clave. */
export default function ProductCard({ product, lang, viewLabel, priority, buy }: Props) {
  const p = product[lang];
  const href = localePath(lang, `/${product.slug}/`);

  return (
    <article className="relative mt-[66px] flex h-full flex-col items-center rounded-3xl border border-[#dce6f1] bg-white px-5 pb-8 text-center">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="-mt-[66px]">
        <Image
          {...product.image}
          alt=""
          priority={priority}
          sizes="160px"
          className="h-[208px] w-auto"
        />
      </Link>
      <p className="mt-2 font-raleway text-xs font-bold leading-3 text-primary">{p.card.badge}</p>
      <h2 className="mt-3 font-raleway text-[22px] font-bold leading-[22px] text-heading-deep">
        <Link href={href} className="hover:text-primary">
          {p.name}
        </Link>
      </h2>
      <h3 className="mt-4 font-raleway text-[13px] font-bold uppercase leading-[13px] text-primary">
        {p.card.tagline}
      </h3>
      <p className="mt-3 font-montserrat text-[13px] leading-[19.5px] text-[#7c7c7c]">{p.card.desc}</p>

      <div className="pt-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#dce6f1] px-5 py-[9px] font-montserrat text-xs font-semibold leading-3 text-secondary">
          <span>{p.card.spec}</span>
          <span aria-hidden="true" className="text-[10px]">
            ●
          </span>
          <span>{p.card.count}</span>
        </p>
        {buy && <div className="mt-4">{buy}</div>}
        <div className="mt-4">
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-[22px] py-[10px] font-roboto text-[15px] font-medium leading-[15px] text-white transition-colors hover:bg-primary-dark"
          >
            {viewLabel}
            <ArrowRightSolidIcon className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
