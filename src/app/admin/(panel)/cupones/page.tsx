import type { Metadata } from "next";
import Link from "next/link";
import { Badge, btnGhost, btnPrimary, PageHeader, table } from "@/components/admin/ui";
import { listCoupons } from "@/lib/admin/data";
import { formatDate, formatUsd } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Cupones" };

export default async function CouponsPage() {
  const { token } = await requireAdmin();
  const coupons = await listCoupons(token);
  return (
    <>
      <PageHeader
        title="Cupones"
        subtitle="Descuentos que el cliente aplica con un código en el checkout."
        actions={
          <Link href="/admin/cupones/nuevo/" className={btnPrimary}>
            Nuevo cupón
          </Link>
        }
      />
      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Código</th>
              <th className={table.th}>Descuento</th>
              <th className={table.th}>Usos</th>
              <th className={table.th}>Vigencia</th>
              <th className={table.th}>Estado</th>
              <th className={table.th} />
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td className={table.td} colSpan={6}>
                  Aún no hay cupones.
                </td>
              </tr>
            )}
            {coupons.map((c) => {
              const expired = c.ends_at && new Date(c.ends_at.replace(" ", "T")) < new Date();
              const exhausted = c.max_uses > 0 && c.used >= c.max_uses;
              return (
                <tr key={c.id}>
                  <td className={table.td}>
                    <Link href={`/admin/cupones/${c.id}/`} className="font-mono font-semibold text-heading-dark hover:underline">
                      {c.code}
                    </Link>
                  </td>
                  <td className={table.td}>
                    {c.kind === "percent" ? `${c.value}%` : formatUsd(c.value)}
                    {c.min_subtotal_usd > 0 && <p className="text-xs text-slate">Desde {formatUsd(c.min_subtotal_usd)}</p>}
                  </td>
                  <td className={table.td}>
                    {c.used}
                    {c.max_uses > 0 ? ` / ${c.max_uses}` : " / ∞"}
                  </td>
                  <td className={table.td}>
                    {c.starts_at || c.ends_at ? `${c.starts_at ? formatDate(c.starts_at).split(",")[0] : "…"} → ${c.ends_at ? formatDate(c.ends_at).split(",")[0] : "…"}` : "Sin límite"}
                  </td>
                  <td className={table.td}>
                    {!c.active ? <Badge>Inactivo</Badge> : expired ? <Badge tone="red">Vencido</Badge> : exhausted ? <Badge tone="amber">Agotado</Badge> : <Badge tone="green">Activo</Badge>}
                  </td>
                  <td className={`${table.td} text-right`}>
                    <Link href={`/admin/cupones/${c.id}/`} className={btnGhost}>
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
