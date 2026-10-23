import { Manrope, Montserrat, Raleway, Roboto } from "next/font/google";

export const raleway = Raleway({ subsets: ["latin"], variable: "--nf-raleway", display: "swap" });
export const manrope = Manrope({ subsets: ["latin"], variable: "--nf-manrope", display: "swap" });
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--nf-roboto",
  display: "swap",
});
export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--nf-montserrat",
  display: "swap",
});

/** Clases que exponen las variables CSS de las fuentes (van en <html>). */
export const fontVariables = `${raleway.variable} ${manrope.variable} ${roboto.variable} ${montserrat.variable}`;
