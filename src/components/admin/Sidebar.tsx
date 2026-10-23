"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; adminOnly?: boolean; /** Número pendiente que se muestra como contador. */ badge?: number };

export default function Sidebar({ items, orientation }: { items: NavItem[]; orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin/" ? pathname === href : pathname.startsWith(href));
  return (
    <nav
      aria-label="Panel"
      className={orientation === "vertical" ? "flex flex-col gap-1" : "flex gap-1 overflow-x-auto px-2 py-2"}
    >
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          aria-current={isActive(it.href) ? "page" : undefined}
          className={`whitespace-nowrap rounded px-3.5 py-2 text-sm font-semibold transition-colors ${
            isActive(it.href) ? "bg-primary-dark text-white" : "text-ink hover:bg-product-bg"
          }`}
        >
          {it.label}
          {!!it.badge && (
            <span className="ml-2 rounded-full bg-[#e0a030] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white" aria-label={`${it.badge} pendientes`}>
              {it.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
