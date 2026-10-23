export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nuvitt.com").replace(/\/$/, "");

/**
 * Interruptor de la tienda (precios, carrito y cuentas). Es una variable de BUILD: cambiarla en
 * Netlify dispara un redeploy. Apagada, el sitio se ve exactamente como el sitio informativo.
 */
export const SHOP_ENABLED = process.env.NEXT_PUBLIC_SHOP_ENABLED === "true";

export const contact = {
  email: "ventas@nuvitt.com",
  phone: "+58 412-3010012",
  whatsapp: "https://wa.me/584123010012",
  instagram: "https://www.instagram.com/nuvittnutrition",
  instagramHandle: "@nuvittnutrition",
  developer: "https://mdnpublicidad.com/",
};

/** Endpoint de FormSubmit (AJAX) que reenvía el formulario de contacto por correo. */
export const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${
  process.env.NEXT_PUBLIC_FORMSUBMIT_TARGET ?? contact.email
}`;

export const retailers = [
  { name: "Maraplus", logo: "LOGO-MARAPLUS-BLANCO.webp" },
  { name: "Locatel", logo: "LOGO-LOCATEL-BLANCO.webp" },
  { name: "Farmacia Río", logo: "LOGO-RIO-BLANCO.webp" },
  { name: "Redvital", logo: "LOGO-REDVITAL-BLANCO.webp" },
  { name: "Alkosto", logo: "LOGO-ALKOSTO-BLANCO.webp" },
  { name: "Farma Express", logo: "LOGO-FARMA-EXPRESS-BLANCO.webp" },
  { name: "Farma Venezuela", logo: "LOGO-FARMA-VENEZUELA-BLANCO.webp" },
  { name: "Farmacias YA", logo: "LOGO-FARMACIAS-YA-BLANCO.webp" },
  { name: "Farmacia Familia", logo: "LOGO-FAMILIA-BLANCO.webp" },
  { name: "Farmacias Nuevo Siglo", logo: "LOGO-FARMACIAS-NUEVO-SIGLO-BLANCO.webp" },
  { name: "Farma Global 24", logo: "LOGO-FARMA-GLOBAL-24-BLANCO.webp" },
  { name: "Farmacias San Ignacio", logo: "LOGO-FARMACIAS-SAN-IGNACIO-BLANCO.webp" },
  { name: "Farmatec", logo: "LOGO-FARMATEC-BLANCO.webp" },
];
