// Post-build: genera public/_redirects con las rutas REALES del sitio y manda el resto a un 404 estático.
//
// Next.js en Netlify enruta toda URL que no es un archivo por su función servidor, así que cada
// petición basura de un bot (/339149944, /wp-login.php…) consumía una invocación de la cuota de
// Functions (un botnet agotó la del team de MDN en octubre de 2026). Con esto, lo desconocido lo
// responde el CDN sin invocar nada.
//
// Se calcula en cada build desde .next/prerender-manifest.json, así que un producto nuevo queda
// permitido solo. Las reglas se evalúan de arriba abajo y gana la primera: las rutas reales se
// reescriben a sí mismas (200) y siguen su camino normal; el resto cae en /404.html.

import { readFile, writeFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile(new URL('../.next/prerender-manifest.json', import.meta.url), 'utf8'))

// El español vive en "/" (se reescribe a /es/…); el inglés bajo /en.
const allowed = new Set(['/'])
for (const route of Object.keys(manifest.routes)) {
  if (route.startsWith('/_') || /\.(png|ico|txt|xml)$/.test(route)) continue
  allowed.add(route === '/es' ? '/' : route.startsWith('/es/') ? route.slice(3) : route)
}
// Rutas con parte dinámica o servidas por Next sin prerender (tienda, panel, API, redirects de next.config).
const wildcards = [
  '/admin/*', '/api/*', '/_next/*',
  '/cuenta/*', '/checkout/*', '/en/cuenta/*', '/en/checkout/*',
  '/nuvitt/*', '/en/nuvitt/*', '/es', '/es/*',
  '/feed', '/vitamin-e-268-mg-2', '/en/vitamin-e-268-mg-2',
  '/robots.txt', '/sitemap.xml',
]

const lines = [
  '# GENERADO por scripts/gen-redirects.mjs — no editar a mano.',
  ...[...allowed].sort().map((p) => `${p}  ${p}  200`),
  ...wildcards.map((p) => `${p}  ${p.endsWith('*') ? p.replace('*', ':splat') : p}  200`),
  '/*  /404.html  404',
  '',
]
await writeFile(new URL('../public/_redirects', import.meta.url), lines.join('\n'))
console.log(`gen-redirects: ${allowed.size} rutas + ${wildcards.length} comodines permitidos`)
