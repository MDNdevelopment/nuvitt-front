import type { NextConfig } from "next";

// Las fotos subidas desde el panel viven en PocketBase (/api/files/...): next/image las optimiza
// solo desde ese host. En pruebas locales (PocketBase en 127.0.0.1) hay que permitir la IP local.
const pb = process.env.POCKETBASE_URL ? new URL(process.env.POCKETBASE_URL) : null;
const pbIsLocal = !!pb && /^(localhost|127\.|\[?::1)/.test(pb.hostname);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: pb
      ? [
          {
            protocol: pb.protocol === "https:" ? "https" : "http",
            hostname: pb.hostname,
            port: pb.port,
            pathname: "/api/files/**",
          },
        ]
      : [],
    dangerouslyAllowLocalIP: pbIsLocal,
  },
  // Las URLs de WordPress terminan en "/"; se mantienen para no perder SEO.
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  /**
   * Enrutado i18n: español en la raíz y inglés bajo "/en". Internamente todo vive
   * en app/[lang]/…, así que el español se reescribe a "/es/…" (sin cambiar la URL).
   * "/admin" y "/api" quedan fuera: tienen su propio layout y rutas (las dinámicas, como
   * /admin/productos/[id], se reescribirían al sitio público y darían 404).
   * Se hace con rewrites (y no con middleware) para que funcione igual en cualquier hosting.
   */
  async rewrites() {
    return {
      afterFiles: [
        { source: "/", destination: "/es" },
        { source: "/:path((?!en(?:/|$)|es(?:/|$)|admin(?:/|$)|api(?:/|$)).+)", destination: "/es/:path" },
      ],
    };
  },
  async redirects() {
    return [
      // El prefijo /es no es público: el español no lleva prefijo.
      { source: "/es", destination: "/", permanent: true },
      { source: "/es/:path+", destination: "/:path+/", permanent: true },
      // El sitemap de WordPress publicaba esta ficha con sufijo "-2".
      { source: "/vitamin-e-268-mg-2", destination: "/vitamin-e-268-mg/", permanent: true },
      { source: "/en/vitamin-e-268-mg-2", destination: "/en/vitamin-e-268-mg/", permanent: true },
      { source: "/feed", destination: "/", permanent: true },
      // Enlaces antiguos de Elementor ("/nuvitt/productos/", "/nuvitt/nosotros/").
      { source: "/nuvitt/:path+", destination: "/:path+/", permanent: true },
      { source: "/en/nuvitt/:path+", destination: "/en/:path+/", permanent: true },
    ];
  },
};

export default nextConfig;
