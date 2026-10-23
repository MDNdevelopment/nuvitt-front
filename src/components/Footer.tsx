import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, MailIcon, WhatsappIcon } from "./icons";
import { img } from "@/lib/images";
import { contact } from "@/lib/site";
import { localePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/es";

export default function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const nav = [
    { href: "/", label: dict.nav.home },
    { href: "/productos/", label: dict.nav.products },
    { href: "/nosotros/", label: dict.nav.about },
    { href: "/contacto/", label: dict.footer.contactLink },
  ];

  return (
    <footer className="bg-primary font-raleway text-white">
      <div className="container-nv relative grid gap-8 py-8 md:grid-cols-[345px_1fr_345px] md:items-start">
        <div>
          <div className="text-center md:max-w-[345px]">
            <Link href={localePath(lang, "/")} className="mb-1 inline-block">
              <Image
                {...img("Logo-Nuvitt-TM-blanco_Mesa-de-trabajo-1-copia-3.webp")}
                alt={dict.common.logoAlt}
                sizes="80px"
                className="h-auto w-20"
              />
            </Link>
            <p className="text-[13px] font-medium leading-[1.5]">{dict.footer.tagline}</p>
          </div>
          <Image
            {...img("bandera-EEUU-NUVITT.webp")}
            alt={dict.common.flagAlt}
            sizes="32px"
            className="absolute left-[377px] top-[58px] hidden h-auto w-8 md:block"
          />
        </div>

        <nav aria-label={dict.footer.navigation} className="text-center">
          <h4 className="mb-2 text-lg font-semibold">{dict.footer.navigation}</h4>
          <ul className="mx-auto grid w-fit grid-cols-2 gap-x-8 gap-y-0.5 text-[13px]">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={localePath(lang, l.href)} className="hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-center">
          <h4 className="mb-2 text-lg font-semibold">{dict.footer.contactTitle}</h4>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px]">
            <li>
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 hover:underline">
                <MailIcon className="size-4" />
                {contact.email}
              </a>
            </li>
            <li>
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:underline"
              >
                <WhatsappIcon className="size-4" />
                {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:underline"
              >
                <InstagramIcon className="size-4" />
                {contact.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="container-nv grid items-center gap-4 py-3 md:grid-cols-[1fr_auto]">
          <p className="font-roboto text-[11px] leading-[1.5] text-white/65 md:text-center">
            {dict.footer.disclaimer}
          </p>
          <div className="flex items-center justify-between gap-3 text-xs md:justify-end">
            <p>{dict.footer.copyright}</p>
            <a
              href={contact.developer}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-semibold"
            >
              <span>{dict.footer.developedBy}</span>
              <Image
                {...img("logo-MDN-studio.webp")}
                alt="MDN Publicidad Studio"
                sizes="40px"
                className="size-10"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
