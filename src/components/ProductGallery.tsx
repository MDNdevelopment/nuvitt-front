"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Props = {
  images: { src: string; width: number; height: number; alt: string }[];
  dotLabel: string;
};

/** Galería de la ficha: frasco + etiqueta, con puntos de navegación. */
export default function ProductGallery({ images, dotLabel }: Props) {
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
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex">
          {images.map((image, i) => (
            <div key={image.src} className="min-w-0 flex-[0_0_100%]">
              <Image
                src={image.src}
                width={image.width}
                height={image.height}
                alt={image.alt}
                priority={i === 0}
                sizes="(min-width: 1025px) 480px, 90vw"
                className="mx-auto h-[360px] w-auto max-w-full object-contain min-[1025px]:h-[470px]"
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              aria-label={`${dotLabel} ${i + 1}`}
              aria-current={i === selected}
              className={`size-2 rounded-full transition-colors ${
                i === selected ? "bg-link-blue" : "bg-primary-light2/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
