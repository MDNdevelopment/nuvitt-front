import type { Metadata } from "next";
import Link from "next/link";
import { Badge, btnGhost, btnPrimary, PageHeader, table } from "@/components/admin/ui";
import { listZones } from "@/lib/admin/data";
import { formatUsd } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Zonas de envío" };

const COURIER: Record<string, string> = { mrw: "MRW", zoom: "Zoom", tealca: "Tealca", other: "Otro" };

export default async function ZonesPage() {
  const { token } = await requireAdmin();
  const zones = await listZones(token);
  return (
    <>
      <PageHeader
        title="Zonas de envío"
        subtitle="Las zonas activas aparecen en el checkout. Sin zonas activas no se puede comprar."
        actions={
          <Link href="/admin/zonas/nueva/" className={btnPrimary}>
            Nueva zona
          </Link>
        }
      />
      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Zona</th>
              <th className={table.th}>Tipo</th>
              <th className={table.th}>Tarifa</th>
              <th className={table.th}>Estado</th>
              <th className={table.th} />
            </tr>
          </thead>
          <tbody>
            {zones.length === 0 && (
              <tr>
                <td className={table.td} colSpan={5}>
                  Aún no hay zonas.
                </td>
              </tr>
            )}
            {zones.map((z) => (
              <tr key={z.id}>
                <td className={table.td}>
                  <Link href={`/admin/zonas/${z.id}/`} className="font-semibold text-heading-dark hover:underline">
                    {z.name_es}
                  </Link>
                  <p className="text-xs text-slate">{z.name_en}</p>
                </td>
                <td className={table.td}>{z.kind === "local" ? "Local" : `Nacional${z.courier ? ` · ${COURIER[z.courier]}` : ""}`}</td>
                <td className={table.td}>{z.price_usd > 0 ? formatUsd(z.price_usd) : "Sin costo"}</td>
                <td className={table.td}>
                  <Badge tone={z.active ? "green" : "gray"}>{z.active ? "Activa" : "Inactiva"}</Badge>
                </td>
                <td className={`${table.td} text-right`}>
                  <Link href={`/admin/zonas/${z.id}/`} className={btnGhost}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
