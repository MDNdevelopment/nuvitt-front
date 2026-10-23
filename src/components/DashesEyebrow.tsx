import type { ReactNode } from "react";

/** Etiqueta de sección con las tres rayas de color a la izquierda. */
export function DashesEyebrow({
  children,
  className = "",
  light = false,
}: {
  children: ReactNode;
  className?: string;
  /** Rayas en tonos claros para fondos oscuros. */
  light?: boolean;
}) {
  const colors = light
    ? ["#ffffff", "#9cc4e8", "#4f92cc"]
    : ["#007ec5", "#4f92cc", "#9cc4e8"];
  return (
    <p className={`flex items-center gap-2.5 ${className}`}>
      <span className="eyebrow-dashes" aria-hidden="true">
        {colors.map((c) => (
          <i key={c} style={{ background: c }} />
        ))}
      </span>
      <span>{children}</span>
    </p>
  );
}
