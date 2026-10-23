"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { img } from "@/lib/images";

export type HeroTile = { bottle: string; bg: string; alt: string };

type Props = {
  tiles: HeroTile[];
  gridLabel: string;
  liposomal: { title: string; brand: string; text: string };
  benefits: { title: string; text: string; cta: string; href: string };
  prevLabel: string;
  nextLabel: string;
};

const AUTOPLAY_MS = 5000;

function Tiles({ tiles, className }: { tiles: HeroTile[]; className: string }) {
  return (
    <ul className={className}>
      {tiles.map((t, i) => (
        <li
          key={t.bottle}
          className="relative flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(/images/${t.bg})` }}
        >
          <Image
            {...img(t.bottle)}
            alt={t.alt}
            priority={i < 4}
            sizes="(min-width: 1025px) 25vw, 33vw"
            className="h-[82%] w-auto object-contain"
          />
        </li>
      ))}
    </ul>
  );
}

export function ChevronArrow({ dir, className = "" }: { dir: "left" | "right"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path
        d={dir === "left" ? "M15 4 7 12l8 8" : "M9 4l8 8-8 8"}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroCarousel({
  tiles,
  gridLabel,
  liposomal,
  benefits,
  prevLabel,
  nextLabel,
}: Props) {
  const [viewportRef, embla] = useEmblaCarousel({ loop: true, duration: 28 });
  const stopped = useRef(false);
  const hovering = useRef(false);
  // Los vídeos (~2,6 MB) solo se cargan en escritorio y tras el primer pintado.
  const [loadVideos, setLoadVideos] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 1025px)").matches) return;
    const id = window.setTimeout(() => setLoadVideos(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  const prev = useCallback(() => {
    stopped.current = true;
    embla?.scrollPrev();
  }, [embla]);
  const next = useCallback(() => {
    stopped.current = true;
    embla?.scrollNext();
  }, [embla]);

  // Autoplay: pausa al pasar el cursor y se detiene tras interactuar.
  useEffect(() => {
    if (!embla) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!stopped.current && !hovering.current && !document.hidden) embla.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [embla]);

  return (
    <section aria-label={gridLabel}>
      {/* Tablet y móvil: grilla estática de frascos */}
      <Tiles
        tiles={tiles}
        className="grid grid-cols-4 grid-rows-3 aspect-[4/3] min-[1025px]:hidden"
      />

      {/* Escritorio: slider de 3 diapositivas */}
      <div
        className="relative hidden h-[608px] min-[1025px]:block"
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
      >
        <div ref={viewportRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {/* 1 · Grilla de frascos */}
            <div className="min-w-0 flex-[0_0_100%]">
              <Tiles tiles={tiles} className="grid h-full grid-cols-4 grid-rows-3" />
            </div>

            {/* 2 · Vitamina C liposomal (vídeo) */}
            <div
              className="relative min-w-0 flex-[0_0_100%] overflow-hidden"
              style={{ background: "linear-gradient(180deg,#F1F4F7 0%,#EEF1F4 55%,#E8EBEF 100%)" }}
            >
              {loadVideos && (
                <video
                  className="absolute right-[3%] top-0 h-full w-auto max-w-none object-contain [mask-image:linear-gradient(90deg,transparent_0%,rgb(0_0_0/.35)_10%,#000_26%,#000_88%,transparent_100%)]"
                  src="/videos/Video-Liposomal-Vitamina-C-banner.webm"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                />
              )}
              <div className="relative z-[2] flex h-full max-w-[44%] flex-col justify-center pl-[50px]">
                <p className="font-raleway text-[52px] font-bold leading-[52px] text-[#00175e]">
                  {liposomal.title}
                </p>
                <p className="font-raleway text-[58px] font-bold leading-[58px] text-[#e1521b]">
                  {liposomal.brand}
                </p>
                <p className="mt-4 font-manrope text-[22px] leading-[22px] text-ink">
                  {liposomal.text}
                </p>
              </div>
            </div>

            {/* 3 · Sumar beneficios (vídeo de frascos) */}
            <div className="relative min-w-0 flex-[0_0_100%] overflow-hidden bg-[#e6edf5]">
              {loadVideos && (
                <video
                  className="absolute inset-0 h-full w-full object-cover [object-position:right_bottom]"
                  src="/videos/nuvitt-frascos-1920x780-60fps-ipad.webm"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                />
              )}
              <div className="relative z-[2] flex h-full max-w-[44%] flex-col justify-center pl-[50px]">
                <p className="font-raleway text-[55px] font-bold leading-[55px] text-primary">
                  {benefits.title}
                </p>
                <p className="mt-5 font-manrope text-[22px] leading-[22px] text-ink">
                  {benefits.text}
                </p>
                <Link href={benefits.href} className="btn mt-6 self-start">
                  {benefits.cta}
                </Link>
              </div>
            </div>
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
      </div>
    </section>
  );
}
