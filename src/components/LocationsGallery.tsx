"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronArrow } from "./HeroCarousel";
import { cities, type Location } from "@/data/locations";
import { img } from "@/lib/images";

/** Color del contador de fotos de cada tarjeta, igual que en el sitio original. */
const COUNT_TONE: Record<string, string> = {
  "Delicias con 73": "#c1e2ff",
  "Bella Vista": "#eb7145",
  "Dr. Portillo": "#85abdd",
  "Fuerzas Armadas": "#85abdd",
  "Andrés Bello": "#eb7145",
  "La Trinidad": "#c1e2ff",
  "Centro Médico Docente La Trinidad": "#85abdd",
  "Las Mercedes": "#eb7145",
  "Los Dos Caminos": "#85abdd",
};

type Labels = {
  photos: string;
  viewGallery: string;
  close: string;
  previous: string;
  next: string;
};

export default function LocationsGallery({ labels }: { labels: Labels }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<{ location: Location; index: number } | null>(null);

  const open = (location: Location) => {
    setCurrent({ location, index: 0 });
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  const step = useCallback((delta: number) => {
    setCurrent((c) => {
      if (!c) return c;
      const n = c.location.photos.length;
      return { ...c, index: (c.index + delta + n) % n };
    });
  }, []);

  // Navegación con el teclado mientras el diálogo está abierto.
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, step]);

  const photo = current?.location.photos[current.index];

  return (
    <>
      <div className="grid gap-12">
        {cities.map((city) => (
          <div key={city.name}>
            <h3
              className="flex items-center gap-2 font-raleway text-[34px] font-semibold leading-none"
              style={{ color: city.accent }}
            >
              <span aria-hidden="true" className="mr-1 size-[9px] rounded-full bg-current" />
              {city.name}
            </h3>
            <ul
              className={`mt-6 grid grid-cols-2 gap-4 lg:px-[15px] ${
                city.locations.length === 4
                  ? "md:grid-cols-4 lg:gap-[30px]"
                  : "md:grid-cols-3 lg:grid-cols-5 lg:gap-[15px]"
              }`}
            >
              {city.locations.map((loc) => (
                <li key={loc.name}>
                  <button
                    type="button"
                    onClick={() => open(loc)}
                    className="group relative block aspect-[250/378] w-full overflow-hidden rounded-2xl text-left lg:aspect-auto lg:h-[378px]"
                  >
                    <Image
                      {...img(loc.cover)}
                      alt=""
                      sizes="(min-width: 1024px) 250px, 45vw"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#1d2a63]/90 via-[#1d2a63]/25 to-transparent" />
                    <span className="absolute inset-x-4 bottom-3 block text-white">
                      <span className="block font-raleway text-lg font-semibold leading-[22px]">
                        {loc.name}
                      </span>
                      <span className="mt-0.5 block text-xs">
                        <span style={{ color: COUNT_TONE[loc.name] }}>
                          {loc.photos.length} {labels.photos}
                        </span>{" "}
                        · {labels.viewGallery}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setCurrent(null)}
        onClick={(e) => e.target === dialogRef.current && close()}
        aria-label={current?.location.name}
        className="m-auto size-full max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/85"
      >
        {current && photo && (
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-4">
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/15 text-2xl leading-none text-white hover:bg-white/30"
            >
              ×
            </button>
            <p className="font-raleway text-lg font-semibold text-white">{current.location.name}</p>
            <Image
              {...img(photo)}
              alt={`${current.location.name} — ${current.index + 1}/${current.location.photos.length}`}
              sizes="90vw"
              className="max-h-[78vh] w-auto max-w-full rounded-lg object-contain"
            />
            <p className="text-sm text-white/80">
              {current.index + 1} / {current.location.photos.length}
            </p>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={labels.previous}
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30"
            >
              <ChevronArrow dir="left" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={labels.next}
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30"
            >
              <ChevronArrow dir="right" className="size-5" />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
