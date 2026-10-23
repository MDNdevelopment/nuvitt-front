import Image from "next/image";
import Link from "next/link";
import { CertificateIcon, FlaskIcon, MicroscopeIcon } from "./icons";
import { img } from "@/lib/images";
import { localePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/es";

const PILLAR_ICONS = [FlaskIcon, MicroscopeIcon, CertificateIcon];

/** Convierte las siglas del texto de la tercera columna en enlaces a las fuentes oficiales. */
const CERT_LINKS: [string, string][] = [
  ["SACS", "https://www.sacs.gob.ve/site/"],
  ["FDA", "https://www.fda.gov/"],
  [
    "GMP",
    "https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements/current-good-manufacturing-practices-cgmps-food-and-dietary-supplements",
  ],
  ["PureWay-C", "https://www.purewayc.com/"],
];

function CertificationText({ text }: { text: string }) {
  const pattern = new RegExp(`(${CERT_LINKS.map(([k]) => k).join("|")})`, "g");
  return (
    <>
      {text.split(pattern).map((part, i) => {
        const link = CERT_LINKS.find(([k]) => k === part);
        if (!link) return <span key={i}>{part}</span>;
        return (
          <a key={i} href={link[1]} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {part}
          </a>
        );
      })}
    </>
  );
}

export default function CommitmentSection({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.commitment;

  return (
    <section className="bg-white py-12 min-[1025px]:py-[48px]">
      <div className="container-nv grid items-center gap-10 min-[1025px]:grid-cols-[1fr_auto] min-[1025px]:gap-[120px] min-[1025px]:pr-[87px]">
        <div className="max-w-[640px]">
          <p className="font-manrope text-base font-bold uppercase text-primary-dark">{t.eyebrow}</p>
          <h2 className="mt-2 font-raleway text-[40px] font-semibold leading-[1] tracking-[-0.02em] text-primary">
            {t.title}
          </h2>
          <p className="mt-4 text-base leading-6 text-body">{t.text}</p>

          <ul className="mt-7 grid gap-6">
            {t.pillars.map((p, i) => {
              const Icon = PILLAR_ICONS[i];
              return (
                <li key={p.title} className="flex items-start gap-4">
                  <span className="grid size-[50px] shrink-0 place-items-center rounded-full border border-primary-light2/60 bg-[#e8f1fa] text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-raleway text-lg font-semibold leading-[18px] tracking-[-0.01em] text-primary">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-[22.5px] text-slate">
                      {i === 2 ? <CertificationText text={p.text} /> : p.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link href={localePath(lang, "/nosotros/")} className="btn mt-6">
            {t.cta}
          </Link>
        </div>

        <Image
          {...img("IMG_4219-1-e1783706801571.webp")}
          alt={t.imageAlt}
          sizes="240px"
          className="mx-auto h-auto w-[240px] rounded-[20px] object-cover shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
        />
      </div>
    </section>
  );
}
