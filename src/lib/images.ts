import sizes from "@/data/image-sizes.json";

const table = sizes as unknown as Record<string, [number, number]>;

/** Props base (src/width/height) para next/image de un archivo de /public/images. */
export function img(name: string) {
  const size = table[name];
  if (!size) throw new Error(`Imagen desconocida en public/images: ${name}`);
  return { src: `/images/${name}`, width: size[0], height: size[1] };
}
