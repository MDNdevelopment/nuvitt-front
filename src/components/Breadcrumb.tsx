import Link from "next/link";

type Crumb = { label: string; href?: string };

/** Ruta de navegación (Inicio › Productos › Nombre). El último elemento es la página actual. */
export default function Breadcrumb({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label} className="container-nv pt-6 min-[1025px]:pt-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-manrope text-[13px] font-medium text-slate">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && (
              <svg viewBox="0 0 24 24" className="size-3.5 text-primary-light2" fill="none" aria-hidden="true">
                <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {c.href ? (
              <Link href={c.href} className="transition-colors hover:text-primary">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-heading-dark">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
