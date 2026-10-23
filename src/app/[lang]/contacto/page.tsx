import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import { DashesEyebrow } from "@/components/DashesEyebrow";
import { InstagramIcon, MailBoxIcon, WhatsappIcon } from "@/components/icons";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { contact } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contacto">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({
    lang,
    path: "/contacto/",
    title: dict.meta.contact.title,
    description: dict.meta.contact.description,
    image: "PROBIOTIC-ADVANTAGE-e1783705532190.webp",
  });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contacto">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.contact;

  const channels = [
    { Icon: MailBoxIcon, label: t.email, value: contact.email, href: `mailto:${contact.email}` },
    { Icon: WhatsappIcon, label: t.phone, value: contact.phone, href: contact.whatsapp },
    {
      Icon: InstagramIcon,
      label: t.instagram,
      value: contact.instagramHandle,
      href: contact.instagram,
    },
  ];

  return (
    <section className="py-10 min-[1025px]:py-[60px]">
      <div className="mx-auto grid w-[min(100%-2rem,970px)] overflow-hidden rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] md:grid-cols-[484px_1fr]">
        <div className="bg-primary-dark px-8 py-10 text-white md:px-10">
          <DashesEyebrow className="text-sm font-semibold uppercase text-primary-light2">
            {t.eyebrow}
          </DashesEyebrow>
          <h1 className="mt-4 font-raleway text-[34px] font-bold leading-[1] min-[1025px]:text-[42px]">
            {t.title}
          </h1>
          <p className="mt-5 max-w-[405px] text-[17px] leading-[25.5px]">{t.text}</p>

          <ul className="mt-14 grid gap-[52px]">
            {channels.map(({ Icon, label, value, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-5 hover:opacity-90"
                >
                  <span className="grid size-[38px] shrink-0 place-items-center rounded border border-white/80">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="text-[15px] leading-[22.5px]">
                    <span className="block text-primary-light2">{label}</span>
                    <span className="block">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white px-8 py-10 md:px-10">
          <h2 className="font-raleway text-[32px] font-bold leading-8 text-[#004f74]">
            {t.form.title}
          </h2>
          <p className="mb-8 mt-4 text-[17px] leading-[25.5px] text-body">{t.form.subtitle}</p>
          <ContactForm labels={t.form} />
        </div>
      </div>
    </section>
  );
}
