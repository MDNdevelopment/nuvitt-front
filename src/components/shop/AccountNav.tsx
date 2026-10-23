"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AccountNavItem = { href: string; label: string };

export default function AccountNav({ items }: { items: AccountNavItem[] }) {
  const pathname = usePathname() ?? "";
  // Compara sin prefijo de idioma ni barra final: "/en/cuenta/pedidos/12/" -> "/cuenta/pedidos/12"
  const norm = (p: string) => p.replace(/^\/(?:en|es)(?=\/|$)/, "").replace(/\/$/, "") || "/";
  const here = norm(pathname);
  const isActive = (href: string) => {
    const h = norm(href);
    return h === "/cuenta" ? here === h : here === h || here.startsWith(`${h}/`);
  };
  return (
    <nav aria-label="Cuenta" className="flex flex-wrap gap-2">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          aria-current={isActive(it.href) ? "page" : undefined}
          className={`rounded-full px-5 py-2 font-raleway text-[15px] font-semibold transition-colors ${
            isActive(it.href) ? "bg-link-blue text-white" : "bg-product-bg text-heading-dark hover:bg-primary-light2"
          }`}
        >
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
