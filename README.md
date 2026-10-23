# Nuvitt — sitio web (Next.js)

Reconstrucción de [nuvitt.com](https://nuvitt.com) (antes WordPress + Elementor) en Next.js.
Es una réplica fiel del sitio actual, en español e inglés, preparada para sumar un ecommerce más adelante.

## Stack

- Next.js (App Router) · React · TypeScript
- Tailwind CSS v4 (tokens de diseño en `src/app/globals.css`)
- Embla Carousel (sliders) · fuentes con `next/font` (Raleway, Manrope, Roboto, Montserrat)
- Formulario de contacto vía [FormSubmit](https://formsubmit.co)
- Despliegue en Netlify (`netlify.toml`)

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # genera las 42 páginas estáticas
npm run start    # sirve el build
npm run lint
```

## Estructura

```
src/
  app/
    [lang]/                 layout (header/footer/fuentes) + páginas
      page.tsx              Home
      productos/page.tsx    Catálogo con filtros
      [slug]/page.tsx       Ficha de producto (13 productos × 2 idiomas)
      nosotros/page.tsx     Nosotros + galerías de ubicaciones
      contacto/page.tsx     Contacto + formulario
    sitemap.ts · robots.ts · icon.png · apple-icon.png
  components/               Header, Footer, HeroCarousel, BenefitsCarousel, ProductCard, …
  data/
    products.json           Fuente única de los 13 productos (textos ES/EN, tabla nutricional,
                            beneficios, categorías, imágenes, SEO)  ← aquí se edita el catálogo
    products.ts             Tipos y helpers
    locations.ts            Ubicaciones y fotos de la página Nosotros
    image-sizes.json        Dimensiones de public/images (lo usa lib/images.ts)
  dictionaries/es.ts · en.ts  Textos de la interfaz y de las secciones fijas
  lib/                      i18n, SEO, constantes del sitio (contacto, puntos de venta)
public/images · public/videos   Assets migrados desde WordPress
```

## Idiomas y URLs

- Español en la raíz (`/productos/`) e inglés bajo `/en/` (`/en/productos/`), igual que en WordPress.
- Internamente todo vive en `app/[lang]/…`; el español se reescribe a `/es/…` mediante `rewrites` en
  `next.config.ts` (sin middleware, por lo que funciona en cualquier hosting). `/es/…` redirige a la URL sin prefijo.
- Las URLs conservan la barra final (`trailingSlash: true`) para no perder SEO.
- Redirecciones heredadas: `/vitamin-e-268-mg-2/` → `/vitamin-e-268-mg/`, `/feed/`, `/nuvitt/*`.
- Cada página emite `canonical` y `hreflang` (es / en / x-default).

## Formulario de contacto

Envía por `fetch` a `https://formsubmit.co/ajax/ventas@nuvitt.com` (con honeypot anti-spam).
**El primer envío dispara un correo de activación a ventas@nuvitt.com**: hay que abrirlo y confirmarlo
una vez; hasta entonces los mensajes no llegan. Opcionalmente, define `NEXT_PUBLIC_FORMSUBMIT_TARGET`
con el alias aleatorio que entrega FormSubmit para no exponer el correo (ver `.env.example`).

## Despliegue (Netlify)

1. Importa el repositorio en Netlify (detecta Next.js automáticamente; `netlify.toml` ya fija Node 22).
2. Variable de entorno `NEXT_PUBLIC_SITE_URL=https://nuvitt.com`.
3. Apunta el dominio y revisa `/sitemap.xml` y `/robots.txt`.

## Pensando en el ecommerce

Los productos ya están modelados en `src/data/products.json` con `slug` estable. Para vender basta con
añadir `sku`, `price`, `stock` (o enlazar un catálogo externo como Shopify/Stripe/Medusa) y crear
carrito/checkout sobre `app/[lang]/[slug]`.
