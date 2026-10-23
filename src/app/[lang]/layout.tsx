import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getDictionary } from "@/lib/dictionaries";
import { fontVariables } from "@/lib/fonts";
import { hasLocale, locales } from "@/lib/i18n";
import { SHOP_ENABLED, SITE_URL } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Nuvitt", template: "%s" },
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-primary"
        >
          {dict.common.skipToContent}
        </a>
        <Header
          lang={lang}
          labels={{
            home: dict.nav.home,
            products: dict.nav.products,
            about: dict.nav.about,
            contact: dict.nav.contact,
            openMenu: dict.common.openMenu,
            closeMenu: dict.common.closeMenu,
            language: dict.common.language,
            logoAlt: dict.common.logoAlt,
            flagAlt: dict.common.flagAlt,
          }}
          shop={SHOP_ENABLED ? { cartLabel: dict.shop.cartCount, accountLabel: dict.shop.account } : undefined}
        />
        <main id="content" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} dict={dict} />
      </body>
    </html>
  );
}
