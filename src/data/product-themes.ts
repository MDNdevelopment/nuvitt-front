import type { CSSProperties } from "react";
import type { ThemeColors } from "./products";

/** Paletas de los productos importados (respaldo si la base de datos no está disponible). */
const themes: Record<string, ThemeColors> = {
  "magnesium-citrate": { accent: "#2E8BC0", dark: "#1D5C82", head: "#22B8DC", tint: "#D8E9F3" },
  "vitamin-d3-k2": { accent: "#FCA311", dark: "#E67E00", head: "#FFDE00", tint: "#FEEDCF" },
  "omega-3-2000-mg": { accent: "#33488F", dark: "#14315E", head: "#4C58A8", tint: "#D9DCEB" },
  "vitamin-c-1000-mg": { accent: "#DD6B28", dark: "#C1501A", head: "#EE8B33", tint: "#F8E3D6" },
  "magnesium-glycinate": { accent: "#2E9BD6", dark: "#0B4C7A", head: "#1E7FC4", tint: "#D9ECF7" },
  "vitamin-e-268-mg": { accent: "#16A34A", dark: "#0F7A46", head: "#0C6B3E", tint: "#D4EEDD" },
  "artiflex-advantage": { accent: "#B23A4A", dark: "#7A1420", head: "#6B0F1A", tint: "#F0D8DB" },
  "potassium-citrate": { accent: "#5A72C4", dark: "#161F45", head: "#3D4F94", tint: "#DEE3F3" },
  "melatonin-extra-strength": { accent: "#4B2E73", dark: "#2A1B4D", head: "#140A1F", tint: "#DDD5E6" },
  "resveratrol-complex": { accent: "#7B408F", dark: "#511268", head: "#692880", tint: "#E6D9EB" },
  "probiotic-advantage": { accent: "#6B4281", dark: "#302866", head: "#543A70", tint: "#E1D9E6" },
  "probiotic-acidophilus": { accent: "#6B4281", dark: "#302866", head: "#462771", tint: "#E1D9E6" },
  "zinc-citrate": { accent: "#007EC5", dark: "#0F6C9F", head: "#6FCBF2", tint: "#E0F2FD" },
};

/** Paleta de un producto importado, para el respaldo products.json. */
export const themeFor = (slug: string): ThemeColors | null => themes[slug] ?? null;

/** Variables CSS que sobrescriben los tokens de color dentro de la ficha. */
export function productThemeStyle(t: ThemeColors | null | undefined): CSSProperties | undefined {
  if (!t) return undefined;
  return {
    "--color-link-blue": t.accent,
    "--color-heading-dark": t.dark,
    "--color-primary-dark": t.dark,
    "--color-primary-light2": `${t.accent}66`,
    "--color-product-bg": t.tint,
    "--color-nutrition-head": t.head,
    "--color-nutrition-body": t.accent,
  } as CSSProperties;
}
