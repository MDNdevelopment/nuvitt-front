import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ZoneForm from "@/components/admin/ZoneForm";
import { Flash, PageHeader, btnDanger, btnGhost } from "@/components/admin/ui";
import { deleteZoneAction } from "@/lib/admin/actions/zones";
import { getZone } from "@/lib/admin/data";
import { PBError } from "@/lib/pb";
import { requireAdmin } from "@/lib/admin/session";
import type { Zone } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Editar zona" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creada?: string }> };

export default async function EditZonePage({ params, searchParams }: Props) {
  const { token } = await requireAdmin();
  const { id } = await params;
  const flags = await searchParams;
  let zone: Zone;
  try {
    zone = await getZone(token, id);
  } catch (e) {
    if (e instanceof PBError && e.status === 404) notFound();
    throw e;
  }
  return (
    <>
      <PageHeader
        title={zone.name_es}
        actions={
          <>
            <Link href="/admin/zonas/" className={btnGhost}>
              Volver
            </Link>
            <form action={deleteZoneAction.bind(null, zone.id)}>
              <ConfirmButton className={btnDanger} message={`¿Eliminar la zona "${zone.name_es}"?`}>
                Eliminar
              </ConfirmButton>
            </form>
          </>
        }
      />
      {flags.creada && (
        <div className="mb-4">
          <Flash ok message="Zona creada." />
        </div>
      )}
      <ZoneForm zone={zone} />
    </>
  );
}
