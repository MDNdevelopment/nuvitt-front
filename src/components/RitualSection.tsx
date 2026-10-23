import Link from "next/link";
import { LongArrowRightIcon } from "./icons";
import { localePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/es";

export default function RitualSection({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.ritual;

  return (
    <section className="bg-white py-10 min-[1025px]:py-[36px]">
      <div className="container-nv grid gap-8 min-[1025px]:grid-cols-[382px_1fr] min-[1025px]:gap-[50px]">
        <div className="min-[1025px]:pt-[6px]">
          <h2 className="font-raleway text-[40px] font-semibold leading-[1] tracking-[-0.02em] text-primary min-[1025px]:text-[49px]">
            {t.title}
          </h2>
          <p className="mt-6 font-roboto text-base leading-6 text-body">{t.text}</p>
          <Link href={localePath(lang, "/productos/")} className="btn mt-8">
            {t.cta}
          </Link>
        </div>

        <ul className="border-t border-transparent">
          {t.items.map((item, i) => (
            <li key={item.title} className={i > 0 ? "border-t border-primary-light2/50" : ""}>
              <Link
                href={`${localePath(lang, "/productos/")}?categoria=${item.category}`}
                className="group flex items-center justify-between gap-4 py-[14px] pl-6 pr-4"
              >
                <span className="block">
                  <span className="block font-raleway text-[22px] font-semibold leading-[22px] tracking-[-0.01em] text-primary transition-colors group-hover:text-primary-dark">
                    {item.title}
                  </span>
                  <span className="mt-[5px] block max-w-[520px] font-manrope text-[15px] leading-[22.5px] text-slate">
                    {item.text}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="grid size-[52px] shrink-0 place-items-center rounded-full border border-primary-light2 text-primary transition-colors group-hover:bg-primary group-hover:text-white"
                >
                  <LongArrowRightIcon className="size-6" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
