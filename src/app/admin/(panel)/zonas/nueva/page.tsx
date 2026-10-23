import type { Metadata } from "next";
import Link from "next/link";
import ZoneForm from "@/components/admin/ZoneForm";
import { PageHeader, btnGhost } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Nueva zona" };

export default async function NewZonePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Nueva zona de envío"
        actions={
          <Link href="/admin/zonas/" className={btnGhost}>
            Volver
          </Link>
        }
      />
      <ZoneForm />
    </>
  );
}
