import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { AddressForm } from "@/components/shop/AccountForms";
import { btnGhost, card } from "@/components/shop/ui";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { deleteAddressAction } from "@/lib/shop/actions/account";
import { getAddress, listAddresses } from "@/lib/shop/data";
import { accountLabels } from "@/lib/shop/labels";
import { safeNext } from "@/lib/shop/next-url";
import { requireCustomer } from "@/lib/shop/session";

export async function generateMetadata({ params }: PageProps<"/[lang]/cuenta/direcciones">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "/cuenta/direcciones/", title: `${dict.account.addresses.title} | Nuvitt`, description: dict.account.meta.description, noindex: true });
}

export default async function AddressesPage({ params, searchParams }: PageProps<"/[lang]/cuenta/direcciones">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { editar, next } = await searchParams;
  const dict = await getDictionary(lang);
  const a = dict.account;
  const { token } = await requireCustomer(lang);
  const [addresses, editing] = await Promise.all([
    listAddresses(token),
    typeof editar === "string" ? getAddress(token, editar) : Promise.resolve(null),
  ]);
  const base = localePath(lang, "/cuenta/direcciones/");

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_460px]">
      <div>
        <h2 className="mb-4 font-raleway text-2xl font-bold text-heading-dark">{a.addresses.title}</h2>
        {addresses.length === 0 && <p className="text-body">{a.addresses.empty}</p>}
        <ul className="space-y-4">
          {addresses.map((ad) => (
            <li key={ad.id} className={card}>
              {ad.label && <p className="font-raleway text-lg font-bold text-heading-deep">{ad.label}</p>}
              <p className="mt-1 text-secondary">
                {ad.recipient} · {ad.phone}
              </p>
              <p className="text-secondary">
                {ad.line}, {ad.city}, {ad.state}
              </p>
              {ad.reference && <p className="text-sm text-body">{ad.reference}</p>}
              <div className="mt-4 flex gap-3">
                <Link href={`${base}?editar=${ad.id}`} className={btnGhost}>
                  {a.actions.edit}
                </Link>
                <form action={deleteAddressAction.bind(null, lang, ad.id)}>
                  <ConfirmButton message={a.actions.confirmDelete} className={`${btnGhost} !border-[#f0c4c0] !text-[#c62828] hover:!bg-[#fdecea]`}>
                    {a.actions.delete}
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={card}>
        <h2 className="mb-4 font-raleway text-xl font-bold text-heading-dark">{editing ? a.addresses.editTitle : a.addresses.newTitle}</h2>
        <AddressForm key={editing?.id ?? "new"} lang={lang} address={editing ?? undefined} labels={accountLabels(dict)} next={typeof next === "string" ? safeNext(lang, next) : undefined} />
        {editing && (
          <Link href={base} className="mt-4 inline-block text-sm font-semibold text-link-blue hover:underline">
            {a.actions.back}
          </Link>
        )}
      </div>
    </div>
  );
}
