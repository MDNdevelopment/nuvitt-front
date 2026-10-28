"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { CategoryKey } from "@/data/products";

type Item = { slug: string; categories: CategoryKey[]; node: ReactNode };

type Props = {
  items: Item[];
  /** Categorías disponibles en el orden en que se muestran los chips. */
  categories: { key: CategoryKey; label: string }[];
  allLabel: string;
  filterLabel: string;
  emptyLabel: string;
  countLabel: string;
  countOneLabel: string;
};

export default function ProductsExplorer({
  items,
  categories,
  allLabel,
  filterLabel,
  emptyLabel,
  countLabel,
  countOneLabel,
}: Props) {
  const [active, setActive] = useState<CategoryKey | "all">("all");

  // El HTML estático se genera sin filtro; el enlace profundo
  // (/productos/?categoria=inmune) se aplica al montar en el navegador.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("categoria");
    const match = categories.find((c) => c.key === param);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con la URL tras la hidratación
    if (match) setActive(match.key);
  }, [categories]);

  const select = useCallback((key: CategoryKey | "all") => {
    setActive(key);
    // Mantiene la URL compartible sin recargar la página.
    const url = new URL(window.location.href);
    if (key === "all") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", key);
    window.history.replaceState(null, "", url);
  }, []);

  const chips: { key: CategoryKey | "all"; label: string }[] = [
    { key: "all", label: allLabel },
    ...categories,
  ];
  const visible = items.filter((i) => active === "all" || i.categories.includes(active));

  return (
    <>
      <div className="relative border-b border-black/5 bg-paper">
        <div aria-hidden="true" className="absolute inset-0 bg-white/70" />
        <div className="container-nv relative pb-8">
          <div role="group" aria-label={filterLabel} className="flex flex-wrap gap-x-5 gap-y-3">
            {chips.map((c) => {
              const on = c.key === active;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => select(c.key)}
                  aria-pressed={on}
                  className={`h-12 rounded-full border px-5 font-raleway text-sm font-semibold transition-colors ${
                    on
                      ? "border-primary-dark bg-primary-dark text-white"
                      : "border-[#e1e6ec] bg-white text-[#3d4a57] hover:border-primary-light2 hover:text-primary"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-[min(100%-2rem,1140px)] pb-28 pt-8">
        <p className="mb-6 font-manrope text-sm font-semibold text-slate" aria-live="polite">
          {visible.length === 1 ? countOneLabel : countLabel.replace("{n}", String(visible.length))}
        </p>
        {visible.length === 0 ? (
          <p className="py-16 text-center text-body">{emptyLabel}</p>
        ) : (
          <ul className="grid gap-x-[30px] gap-y-[96px] sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((i) => (
              <li key={i.slug}>{i.node}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
