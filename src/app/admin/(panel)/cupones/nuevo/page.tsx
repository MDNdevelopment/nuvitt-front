import type { Metadata } from "next";
import Link from "next/link";
import CouponForm from "@/components/admin/CouponForm";
import { PageHeader, btnGhost } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Nuevo cupón" };

export default async function NewCouponPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Nuevo cupón"
        actions={
          <Link href="/admin/cupones/" className={btnGhost}>
            Volver
          </Link>
        }
      />
      <CouponForm />
    </>
  );
}
