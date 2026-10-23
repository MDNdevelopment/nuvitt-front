import type { ProductLocale } from "@/data/products";

/** Tabla nutricional con el mismo estilo "etiqueta" del sitio original. */
export default function NutritionTable({
  nutrition,
  amountHeader,
}: {
  nutrition: ProductLocale["nutrition"];
  amountHeader: string;
}) {
  return (
    <div>
      <div className="border-[3px] border-white font-raleway text-white shadow-[0_0_0_1px_var(--color-nutrition-head)]">
        <div className="bg-nutrition-head px-[10px] pb-2 pt-[6px]">
          <p className="border-b-2 border-white pb-1 text-[22px] font-bold leading-[22px]">
            {nutrition.subtitle}
          </p>
          <div className="pt-2 text-[15px] font-semibold leading-[20px]">
            {nutrition.serving.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className="border-t-[5px] border-white bg-nutrition-body px-[10px] pb-3">
          <div className="grid grid-cols-[1fr_110px_90px] items-end border-b border-white/70 py-1 text-center text-[15px] font-semibold leading-[15px]">
            <span />
            <span>{amountHeader}</span>
            <span>{nutrition.dvHeader}</span>
          </div>

          <div className="divide-y divide-white/40">
            {nutrition.rows.map((row, i) =>
              row.note ? (
                <p key={i} className="py-2 text-[15px] font-semibold leading-[18px]">
                  {row.name[0]}
                </p>
              ) : (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_110px_90px] items-center py-3 text-[15px] font-semibold leading-[18px]"
                >
                  <div>
                    {row.name.map((line, n) => (
                      <p key={n} className={n > 0 ? "text-[13px] font-medium opacity-90" : undefined}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <p className="text-center text-lg">{row.amount}</p>
                  <p className="text-center text-lg">{row.dv}</p>
                </div>
              ),
            )}
          </div>

          <p className="mt-2 border-t-2 border-white pt-2 text-[15px] font-semibold leading-[18px]">
            {nutrition.footnote}
          </p>
        </div>
      </div>

      <p className="mt-3 px-[5px] font-raleway text-[15px] font-medium leading-[15px] text-link-blue">
        <b className="font-bold">{nutrition.others.split(":")[0]}:</b>
        {nutrition.others.slice(nutrition.others.indexOf(":") + 1)}
      </p>
    </div>
  );
}
