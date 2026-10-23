"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaretDownIcon } from "./icons";
import CartButton from "./shop/CartButton";
import { UserIcon } from "./shop/icons";
import { img } from "@/lib/images";
import { localePath, type Locale } from "@/lib/i18n";

type Props = {
  lang: Locale;
  labels: {
    home: string;
    products: string;
    about: string;
    contact: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    logoAlt: string;
    flagAlt: string;
  };
  /** Presente solo con la tienda encendida: ícono de carrito y enlace a la cuenta. */
  shop?: { cartLabel: string; accountLabel: string };
};

/** Quita el prefijo de idioma para comparar rutas internas. */
function stripLocale(pathname: string) {
  const p = pathname.replace(/^\/(?:en|es)(?=\/|$)/, "");
  return p === "" ? "/" : p;
}

export default function Header({ lang, labels, shop }: Props) {
  const pathname = usePathname() ?? "/";
  const current = stripLocale(pathname).replace(/\/?$/, "/");
  // Se guarda la ruta en la que se abrió cada menú: al navegar dejan de coincidir y se cierran solos.
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const [langOpenAt, setLangOpenAt] = useState<string | null>(null);
  const menuOpen = menuOpenAt === pathname;
  const langOpen = langOpenAt === pathname;
  const setMenuOpen = (open: boolean | ((v: boolean) => boolean)) =>
    setMenuOpenAt((cur) => {
      const next = typeof open === "function" ? open(cur === pathname) : open;
      return next ? pathname : null;
    });
  const setLangOpen = (open: boolean | ((v: boolean) => boolean)) =>
    setLangOpenAt((cur) => {
      const next = typeof open === "function" ? open(cur === pathname) : open;
      return next ? pathname : null;
    });
  const langRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/", label: labels.home },
    { href: "/productos/", label: labels.products },
    { href: "/nosotros/", label: labels.about },
    { href: "/contacto/", label: labels.contact },
  ];

  // Cierra el selector de idioma al hacer clic fuera o pulsar Escape.
  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpenAt(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLangOpenAt(null);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  const targetFor = (l: Locale) => localePath(l, stripLocale(pathname));

  const languageSwitcher = (
    <div ref={langRef} className="relative">
      <button
        type="button"
        onClick={() => setLangOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        aria-label={labels.language}
        className="flex items-center gap-2 px-1 py-2 text-sm text-slate"
      >
        <span className="uppercase">{lang}</span>
        <CaretDownIcon className="w-3 text-slate" />
      </button>
      {langOpen && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 min-w-16 rounded bg-white py-1 text-sm shadow-lg ring-1 ring-black/5"
        >
          {(["es", "en"] as const).map((l) => (
            <li key={l} role="option" aria-selected={l === lang}>
              <Link
                href={targetFor(l)}
                hrefLang={l}
                className={`block px-4 py-1.5 uppercase hover:bg-slate/10 ${
                  l === lang ? "font-bold text-primary" : "text-slate"
                }`}
              >
                {l}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-[90px] max-w-[1140px] items-center justify-between px-6">
        <Link href={localePath(lang, "/")} className="shrink-0" aria-label={labels.logoAlt}>
          <Image
            {...img("LOGO-NUVITT-TM.webp")}
            alt={labels.logoAlt}
            priority
            sizes="120px"
            className="h-auto w-[120px] md:w-[120px]"
          />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-[9px]">
            {links.map((l) => {
              const active = current === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={localePath(lang, l.href)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded px-5 py-[13px] font-raleway text-base font-semibold uppercase leading-5 transition-colors ${
                      active
                        ? "bg-primary text-white"
                        : "text-slate hover:text-primary"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {shop && (
            <div className="order-0 flex items-center lg:order-3">
              <Link
                href={localePath(lang, "/cuenta/")}
                aria-label={shop.accountLabel}
                className="grid size-10 place-items-center rounded text-slate transition-colors hover:text-primary"
              >
                <UserIcon className="size-[22px]" />
              </Link>
              <CartButton href={localePath(lang, "/carrito/")} label={shop.cartLabel} />
            </div>
          )}
          <div className="order-1 lg:order-2">{languageSwitcher}</div>
          <Image
            {...img("bandera-EEUU-NUVITT.webp")}
            alt={labels.flagAlt}
            sizes="36px"
            className="order-2 h-auto w-[35px] lg:order-1 lg:mr-[34px]"
          />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
            className="order-3 grid size-10 place-items-center rounded bg-black/5 lg:hidden"
          >
            <span className="grid gap-[5px]" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className="block h-[3px] w-5 rounded bg-slate" />
              ))}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Principal"
          className="border-t border-black/5 bg-white lg:hidden"
        >
          <ul className="mx-auto max-w-[1140px] px-6 py-2">
            {links.map((l) => {
              const active = current === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={localePath(lang, l.href)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded px-3 py-3 font-raleway text-base font-semibold uppercase ${
                      active ? "bg-primary text-white" : "text-slate"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
