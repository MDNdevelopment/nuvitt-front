import Link from "next/link";
import { btnPrimary } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <p className="font-raleway text-5xl font-bold text-primary-dark">404</p>
        <p className="mb-5 mt-2 text-ink">No encontramos lo que buscas.</p>
        <Link href="/admin/" className={btnPrimary}>
          Volver al resumen
        </Link>
      </div>
    </main>
  );
}
