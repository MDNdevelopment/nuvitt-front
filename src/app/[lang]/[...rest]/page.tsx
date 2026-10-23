import { notFound } from "next/navigation";

// Cualquier ruta con más de un segmento que no exista responde 404.
export default function CatchAll() {
  notFound();
}

export function generateStaticParams() {
  return [{ lang: "es", rest: ["404"] }];
}

export const dynamicParams = true;
