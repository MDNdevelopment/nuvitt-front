"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Props = {
  images: { src: string; width: number; height: number; alt: string }[];
  dotLabel: string;
  /** Color de fondo del panel (tinte del producto). */
  tint?: string;
};

/** Galería de la ficha: frasco + etiqueta sobre un panel de color, con miniaturas clicables. */
export default function ProductGallery({ images, dotLabel, tint = "#d8e9f3" }: Props) {
  const [viewportRef, embla] = useEmblaCarousel({ loop: false });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  return (
    <div>
      <div className="overflow-hidden rounded-3xl" style={{ background: `radial-gradient(circle at 50% 45%, #ffffff 0%, ${tint} 80%)` }}>
        <div ref={viewportRef} className="overflow-hidden">
          <div className="flex">
            {images.map((image, i) => (
              <div key={image.src} className="min-w-0 flex-[0_0_100%] py-6">
                <Image
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.alt}
                  priority={i === 0}
                  sizes="(min-width: 1025px) 480px, 90vw"
                  className="mx-auto h-[340px] w-auto max-w-full object-contain min-[1025px]:h-[460px]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-3">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              aria-label={`${dotLabel} ${i + 1}`}
              aria-current={i === selected}
              className={`grid size-[72px] place-items-center rounded-xl border-2 bg-white transition-all ${
                i === selected ? "border-link-blue shadow-md" : "border-[#dce6f1] opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={image.src} width={image.width} height={image.height} alt="" sizes="64px" className="h-[56px] w-auto object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
