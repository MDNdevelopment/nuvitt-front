import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashesEyebrow } from "@/components/DashesEyebrow";
import { BatteryIcon, MoonIcon, StarIcon, WalkingIcon } from "@/components/icons";
import LocationsGallery from "@/components/LocationsGallery";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, localePath } from "@/lib/i18n";
import { img } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

const MISSION_ICONS = [BatteryIcon, MoonIcon, StarIcon, WalkingIcon];
const STRIPES = ["#e62e3c", "#f39344", "#27b9d3", "#1f2b53", "#4a2d74"];

const FDA_URL = "https://www.fda.gov/";
const SACS_URL = "https://www.sacs.gob.ve/site/";
const GMP_URL =
  "https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements/current-good-manufacturing-practices-cgmps-food-and-dietary-supplements";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/nosotros">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({
    lang,
    path: "/nosotros/",
    title: dict.meta.about.title,
    description: dict.meta.about.description,
    image: "Banner-home-1.webp",
  });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/nosotros">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.about;

  const badges: { image: string; alt: string; href?: string }[] = [
    { image: "FDA-1.webp", alt: t.badges.fda, href: FDA_URL },
    { image: "GMO-Free.webp", alt: t.badges.gmo },
    { image: "sacs.webp", alt: t.badges.sacs, href: SACS_URL },
    { image: "Gluten-Free.webp", alt: t.badges.gluten },
    { image: "GMP.webp", alt: t.badges.gmp, href: GMP_URL },
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-12 min-[1025px]:py-[50px]">
        <div className="container-nv grid items-center gap-10 min-[1025px]:grid-cols-[595px_1fr] min-[1025px]:gap-[100px]">
          <div>
            <h1 className="font-raleway text-[40px] font-extrabold leading-[1] text-heading-deep min-[1025px]:text-[52px]">
              {t.hero.title}
            </h1>
            <p className="mt-8 text-base leading-[25.5px] text-body min-[1025px]:text-[17px]">
              {t.hero.text}
            </p>
            <div className="mt-8 flex flex-wrap gap-5">
              <Link
                href={localePath(lang, "/productos/")}
                className="rounded border border-primary-light2 px-7 py-[18px] font-manrope text-base font-semibold leading-4 text-primary-dark transition-colors hover:bg-product-bg"
              >
                {dict.common.viewProducts}
              </Link>
              <Link
                href={localePath(lang, "/contacto/")}
                className="rounded bg-primary-dark px-7 py-[18px] font-manrope text-base font-semibold leading-4 text-white transition-colors hover:bg-primary"
              >
                {dict.common.contactUs}
              </Link>
            </div>
          </div>
          <Image
            {...img("Banner-home-1.webp")}
            alt={t.hero.imageAlt}
            priority
            sizes="(min-width: 1025px) 425px, 90vw"
            className="mx-auto h-auto w-full max-w-[425px] rounded-[20px] shadow-[0_12px_30px_rgba(0,0,0,0.15)] min-[1025px]:mr-0"
          />
        </div>
      </section>

      {/* Sellos */}
      <section className="bg-primary-mid">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-2 items-center gap-y-1 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => {
            const image = (
              <Image
                {...img(b.image)}
                alt={b.alt}
                sizes="200px"
                className="mx-auto h-auto w-[200px]"
              />
            );
            return (
              <li key={b.image}>
                {b.href ? (
                  <a href={b.href} target="_blank" rel="noopener noreferrer" className="block">
                    {image}
                  </a>
                ) : (
                  image
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Calidad */}
      <section className="bg-paper-veil py-12 min-[1025px]:py-[40px]">
        <div className="mx-auto grid w-[min(100%-2rem,1120px)] items-center gap-10 min-[1025px]:grid-cols-[408px_1fr] min-[1025px]:gap-[151px] min-[1025px]:px-[51px]">
          <Image
            {...img("PRODUCTOS-NUVITT-NOSOTROS-scaled-e1784211364895.webp")}
            alt={t.quality.imageAlt}
            sizes="(min-width: 1025px) 408px, 90vw"
            className="mx-auto h-auto w-full max-w-[408px] rounded-[20px] object-cover"
          />
          <div>
            <DashesEyebrow className="text-sm font-semibold uppercase text-heading-deep">
              {t.quality.eyebrow}
            </DashesEyebrow>
            <h2 className="mt-4 font-raleway text-[34px] font-bold leading-[1] text-heading-deep min-[1025px]:text-[42px]">
              {t.quality.title}
            </h2>
            <p className="mt-5 text-base leading-[25.5px] text-body min-[1025px]:text-[17px]">
              {t.quality.text}
            </p>
          </div>
        </div>
      </section>

      {/* Franja de colores */}
      <div aria-hidden="true" className="grid h-[60px] grid-cols-5">
        {STRIPES.map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </div>

      {/* Misión */}
      <section className="py-14 min-[1025px]:py-[70px]">
        <div className="container-nv grid gap-10 min-[1025px]:grid-cols-[510px_1fr] min-[1025px]:gap-[100px]">
          <div>
            <DashesEyebrow className="text-sm font-semibold text-heading-deep">
              {t.mission.eyebrow}
            </DashesEyebrow>
            <h2 className="mt-4 whitespace-pre-line font-raleway text-[34px] font-bold leading-[1] text-heading-deep min-[1025px]:text-[42px]">
              {t.mission.title}
            </h2>
            <div className="mt-6 grid gap-4 text-base leading-[25.5px] text-body min-[1025px]:text-[17px]">
              {t.mission.text.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </div>

          <ul className="self-center">
            {t.mission.items.map((item, i) => {
              const Icon = MISSION_ICONS[i];
              return (
                <li
                  key={item}
                  className="flex items-center gap-[44px] border-b border-primary-light2/50 py-[28px] first:pt-0 last:border-b-0 last:pb-0"
                >
                  <span className="grid size-[46px] shrink-0 place-items-center rounded-full border border-primary-light2 text-primary">
                    <Icon className="size-[18px]" />
                  </span>
                  <h3 className="font-raleway text-2xl font-semibold leading-6 tracking-[-0.01em] text-primary">
                    {item}
                  </h3>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="mx-auto h-px w-[min(100%-1rem,1420px)] bg-black/10" />

      {/* Ubicaciones */}
      <section className="py-14 min-[1025px]:py-[50px]">
        <div className="container-nv">
          <DashesEyebrow className="text-sm font-semibold text-heading-deep">
            {t.locations.eyebrow}
          </DashesEyebrow>
          <h2 className="mt-4 font-raleway text-[34px] font-bold leading-[1] text-heading-deep min-[1025px]:text-[42px]">
            {t.locations.title}
          </h2>
          <div className="mt-8">
            <LocationsGallery
              labels={{
                photos: t.locations.photos,
                viewGallery: t.locations.viewGallery,
                close: t.locations.close,
                previous: t.locations.previous,
                next: t.locations.next,
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
