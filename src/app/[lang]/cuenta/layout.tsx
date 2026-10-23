import { notFound } from "next/navigation";
import AccountNav from "@/components/shop/AccountNav";
import { btnGhost } from "@/components/shop/ui";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { logoutAction } from "@/lib/shop/actions/account";
import { getCustomer } from "@/lib/shop/session";
import { SHOP_ENABLED } from "@/lib/site";

export default async function AccountLayout({ children, params }: LayoutProps<"/[lang]/cuenta">) {
  const { lang } = await params;
  if (!hasLocale(lang) || !SHOP_ENABLED) notFound();
  const dict = await getDictionary(lang);
  const session = await getCustomer();
  const a = dict.account;

  return (
    <section className="py-10 min-[1025px]:py-[70px]">
      <div className="container-nv">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-raleway text-[36px] font-bold leading-none text-heading-dark min-[1025px]:text-[44px]">
            {session ? a.welcome.replace("{name}", session.user.name.split(" ")[0] || session.user.email) : a.title}
          </h1>
          {session && (
            <form action={logoutAction.bind(null, lang)}>
              <button type="submit" className={btnGhost}>
                {a.actions.logout}
              </button>
            </form>
          )}
        </div>
        {session && (
          <div className="mb-8">
            <AccountNav
              items={[
                { href: localePath(lang, "/cuenta/"), label: a.nav.profile },
                { href: localePath(lang, "/cuenta/pedidos/"), label: a.nav.orders },
                { href: localePath(lang, "/cuenta/direcciones/"), label: a.nav.addresses },
              ]}
            />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
