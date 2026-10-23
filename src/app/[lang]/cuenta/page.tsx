import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AuthForms, ProfileForm } from "@/components/shop/AccountForms";
import { card } from "@/components/shop/ui";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { accountLabels } from "@/lib/shop/labels";
import { safeNext } from "@/lib/shop/next-url";
import { getCustomer } from "@/lib/shop/session";

export async function generateMetadata({ params }: PageProps<"/[lang]/cuenta">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "/cuenta/", title: dict.account.meta.title, description: dict.account.meta.description, noindex: true });
}

export default async function AccountPage({ params, searchParams }: PageProps<"/[lang]/cuenta">) {
  const { lang } = await params;
  const { next } = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const labels = accountLabels(dict);
  const session = await getCustomer();

  const dest = typeof next === "string" ? safeNext(lang, next) : undefined;
  if (session && dest && dest !== localePath(lang, "/cuenta/")) redirect(dest);
  if (!session) return <AuthForms lang={lang} labels={labels} next={dest} />;
  return (
    <div className={`${card} max-w-[640px]`}>
      <ProfileForm lang={lang} user={session.user} labels={labels} />
    </div>
  );
}
