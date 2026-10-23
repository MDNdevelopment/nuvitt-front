import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import CouponForm from "@/components/admin/CouponForm";
import { Flash, PageHeader, btnDanger, btnGhost } from "@/components/admin/ui";
import { deleteCouponAction } from "@/lib/admin/actions/coupons";
import { getCoupon } from "@/lib/admin/data";
import { PBError } from "@/lib/pb";
import { requireAdmin } from "@/lib/admin/session";
import type { Coupon } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Editar cupón" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string }> };

export default async function EditCouponPage({ params, searchParams }: Props) {
  const { token } = await requireAdmin();
  const { id } = await params;
  const flags = await searchParams;
  let coupon: Coupon;
  try {
    coupon = await getCoupon(token, id);
  } catch (e) {
    if (e instanceof PBError && e.status === 404) notFound();
    throw e;
  }
  return (
    <>
      <PageHeader
        title={coupon.code}
        actions={
          <>
            <Link href="/admin/cupones/" className={btnGhost}>
              Volver
            </Link>
            <form action={deleteCouponAction.bind(null, coupon.id)}>
              <ConfirmButton className={btnDanger} message={`¿Eliminar el cupón "${coupon.code}"?`}>
                Eliminar
              </ConfirmButton>
            </form>
          </>
        }
      />
      {flags.creado && (
        <div className="mb-4">
          <Flash ok message="Cupón creado." />
        </div>
      )}
      <CouponForm coupon={coupon} />
    </>
  );
}
