import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Panel · Nuvitt", template: "%s · Panel Nuvitt" },
  robots: { index: false, follow: false },
};

// Root layout propio del panel: el sitio público vive en app/[lang]/layout.tsx.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontVariables}>
      <body className="min-h-screen bg-[#f4f7fa] text-ink">{children}</body>
    </html>
  );
}
