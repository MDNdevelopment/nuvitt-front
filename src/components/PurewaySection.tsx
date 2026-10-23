import Image from "next/image";
import { ArrowRightSolidIcon } from "./icons";
import { img } from "@/lib/images";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/es";

const BADGES = {
  es: {
    clinical: "Purewayc-4-clinical-es.webp",
    retention: "233-retencion-pureway-esp-1.webp",
    delivery: "advanced-delivery-pureway-es-1.webp",
  },
  en: {
    clinical: "Purewayc-4-clinical-en.webp",
    retention: "Purewayc-233.webp",
    delivery: "Purewayc-AD.webp",
  },
} as const;

export default function PurewaySection({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.pureway;
  const badges = BADGES[lang];

  const items = [
    { image: badges.clinical, alt: t.clinicalAlt, text: t.clinicalText },
    { image: badges.retention, alt: t.retentionAlt, text: t.retentionText },
    { image: badges.delivery, alt: t.deliveryAlt, text: t.deliveryText },
  ];

  return (
    <section
      className="relative overflow-hidden bg-[#fbf3ec] bg-cover bg-[position:left_center] py-6 min-[1025px]:min-h-[492px]"
      style={{ backgroundImage: "url(/images/FONDO-SECCION-PUREWAY.webp)" }}
    >
      <div className="mx-auto w-[min(100%-2rem,1140px)]">
        <h2 className="flex justify-center">
          <Image
            {...img("pureway-c-advantage.webp")}
            alt={t.comparisonAlt}
            sizes="(min-width: 1025px) 605px, 90vw"
            className="h-auto w-[min(605px,90%)]"
          />
        </h2>

        <div className="relative mt-4 grid items-start gap-8 min-[1025px]:grid-cols-[minmax(0,465px)_1fr] min-[1025px]:gap-0">
          <div className="relative mx-auto w-[min(344px,80%)] min-[1025px]:mx-0 min-[1025px]:ml-[-1px] min-[1025px]:mt-[3px]">
            <Image
              {...img("LIPOSOMAL-2.webp")}
              alt={t.bottleAlt}
              sizes="344px"
              className="animate-levitate h-auto w-full"
            />
          </div>

          <div className="relative min-[1025px]:pt-3.5">
            <ul className="grid gap-8 min-[769px]:grid-cols-3 min-[769px]:gap-5">
              {items.map((it) => (
                <li key={it.image} className="flex flex-col items-center text-center">
                  <Image
                    {...img(it.image)}
                    alt={it.alt}
                    sizes="92px"
                    className="h-auto w-[92px] [mix-blend-mode:multiply]"
                  />
                  <p className="mt-3 max-w-[200px] font-roboto text-sm leading-[1.5] text-body">
                    {it.text}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-center gap-6 min-[769px]:mt-4 min-[769px]:block">
              <a
                href="https://www.purewayc.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#ec4a12] px-[18px] py-[11px] font-roboto text-[15px] font-semibold text-white transition-colors hover:bg-[#c93d0c] min-[1025px]:absolute min-[1025px]:bottom-[25px] min-[1025px]:left-[55px] min-[1025px]:z-10"
              >
                {t.more}
                <ArrowRightSolidIcon className="size-3.5" />
              </a>
              <Image
                {...img("NARANJA-LOPOSOMAL.webp")}
                alt={t.orangeAlt}
                sizes="260px"
                className="h-auto w-[260px] min-[769px]:mx-auto min-[769px]:mt-0 min-[1025px]:-translate-y-2.5 min-[1025px]:translate-x-2.5"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
