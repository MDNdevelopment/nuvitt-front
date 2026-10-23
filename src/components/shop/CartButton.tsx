"use client";

import Link from "next/link";
import { useCart } from "@/lib/shop/cart";
import { CartIcon } from "./icons";

export default function CartButton({ href, label }: { href: string; label: string }) {
  const { count } = useCart();
  return (
    <Link href={href} aria-label={label.replace("{n}", String(count))} className="relative grid size-10 place-items-center rounded text-slate transition-colors hover:text-primary">
      <CartIcon className="size-[22px]" />
      {count > 0 && (
        <span className="absolute right-0 top-0 grid min-w-[18px] place-items-center rounded-full bg-primary-dark px-1 text-[11px] font-bold leading-[18px] text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
