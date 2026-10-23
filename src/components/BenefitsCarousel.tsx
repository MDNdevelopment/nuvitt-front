"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { ChevronArrow } from "./HeroCarousel";
import { img } from "@/lib/images";

export type BenefitSlide = {
  title: string;
  text: string;
  cta: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  product?: { name: string; href: string; image: { src: string; width: number; height: number }; alt: string };
};

type Props = {
  slides: BenefitSlide[];
  featuredLabel: string;
  prevLabel: string;
  nextLabel: string;
};

const AUTOPLAY_MS = 5000;

export default function BenefitsCarousel({ slides, featuredLabel, prevLabel, nextLabel }: Props) {
  const [viewportRef, embla] = useEmblaCarousel({ loop: true, duration: 28 });
  const stopped = useRef(false);
  const hovering = useRef(false);

  const prev = useCallback(() => {
    stopped.current = true;
    embla?.scrollPrev();
  }, [embla]);
  const next = useCallback(() => {
    stopped.current = true;
    embla?.scrollNext();
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!stopped.current && !hovering.current && !document.hidden) embla.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [embla]);

  return (
    <section
      className="bg-paper-veil relative"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((s, i) => {
            const Heading = i === 0 ? "h1" : "h2";
            return (
              <div key={s.title} className="min-w-0 flex-[0_0_100%] py-12 min-[1025px]:py-[76px]">
                <div className="mx-auto grid w-[min(100%-4rem,1100px)] items-center gap-10 min-[1025px]:grid-cols-[480px_1fr]">
                  <div>
                    <Heading className="font-raleway text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-primary-mid min-[1025px]:text-[60px] min-[1025px]:leading-[60px]">
                      {s.title}
                    </Heading>
                    <p className="mt-6 text-lg leading-[1.65] text-body">{s.text}</p>
                    <Link href={s.ctaHref} className="btn mt-8">
                      {s.cta}
                    </Link>
                  </div>

                  <div className="relative ml-auto w-full max-w-[430px] min-[1025px]:mr-0">
                    <Image
                      {...img(s.image)}
                      alt={s.imageAlt}
                      sizes="(min-width: 1025px) 430px, 90vw"
                      className="aspect-square w-full rounded-[28px] object-cover"
                    />
                    {s.product && (
                    <Link
                      href={s.product.href}
                      className="absolute bottom-[26px] left-0 flex items-center gap-4 rounded-3xl bg-white p-3 pr-6 shadow-[0_10px_30px_rgba(0,0,0,0.12)] min-[1025px]:-left-[145px]"
                    >
                      <Image
                        {...s.product.image}
                        alt={s.product.alt}
                        sizes="64px"
                        className="h-[130px] w-auto"
                      />
                      <span className="block w-[152px]">
                        <span className="block whitespace-nowrap font-roboto text-xs font-semibold uppercase text-primary">
                          {featuredLabel}
                        </span>
                        <span className="mt-1 block max-w-[112px] font-montserrat text-[19px] font-semibold leading-[19px] text-primary-dark">
                          {s.product.name}
                        </span>
                      </span>
                    </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label={prevLabel}
        className="absolute left-1 top-1/2 z-10 -translate-y-1/2 p-2 text-primary"
      >
        <ChevronArrow dir="left" className="size-6" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label={nextLabel}
        className="absolute right-1 top-1/2 z-10 -translate-y-1/2 p-2 text-primary"
      >
        <ChevronArrow dir="right" className="size-6" />
      </button>
    </section>
  );
}
