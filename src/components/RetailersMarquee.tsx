import Image from "next/image";
import { img } from "@/lib/images";
import { retailers } from "@/lib/site";

export default function RetailersMarquee({ label }: { label: string }) {
  // La lista se duplica para que la animación en bucle no tenga saltos.
  const loop = [...retailers, ...retailers];

  return (
    <section aria-label={label} className="marquee overflow-hidden bg-primary-mid">
      <ul className="marquee-track items-center py-[6px]">
        {loop.map((r, i) => (
          <li
            key={`${r.name}-${i}`}
            aria-hidden={i >= retailers.length ? true : undefined}
            className="flex h-[102px] w-[205px] shrink-0 items-center justify-center"
          >
            <Image
              {...img(r.logo)}
              alt={i < retailers.length ? r.name : ""}
              sizes="100px"
              className="h-auto w-[100px]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
