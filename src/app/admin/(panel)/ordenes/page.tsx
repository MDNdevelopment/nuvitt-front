import type { Metadata } from "next";
import Link from "next/link";
import { Badge, btnGhost, Input, PageHeader, table } from "@/components/admin/ui";
import { getShopConfig, listOrders, orderCounts, ORDERS_PER_PAGE } from "@/lib/admin/data";
import { formatBs, formatDate, formatUsd } from "@/lib/admin/format";
import { ORDER_STATUSES, STATUS_LABEL, STATUS_TONE } from "@/lib/admin/order-flow";
import { requireStaff } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Órdenes" };

type Props = { searchParams: Promise<{ estado?: string; q?: string; p?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  const { token } = await requireStaff();
  const { estado = "", q = "", p = "1" } = await searchParams;
  const status = (ORDER_STATUSES as string[]).includes(estado) ? estado : "";
  const page = Math.max(1, parseInt(p, 10) || 1);
  const [list, counts, config] = await Promise.all([
    listOrders(token, { status, search: q, page }),
    orderCounts(token),
    getShopConfig().catch(() => null),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const href = (over: Record<string, string>) => {
    const sp = new URLSearchParams({ ...(status && { estado: status }), ...(q && { q }), ...over });
    for (const [k, v] of [...sp]) if (!v) sp.delete(k);
    const s = sp.toString();
    return `/admin/ordenes/${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Órdenes" subtitle="Pedidos de los clientes. Entra a una orden para cambiar su estado, cargar la guía o escribir notas." />

      {!config?.payments_enabled && (
        <p className="mb-4 rounded-md bg-[#fff4e0] px-4 py-3 text-sm text-[#a96400]">Los pagos en línea aún no están habilitados: las órdenes aparecerán aquí cuando se active Banco Plaza.</p>
      )}

      <nav aria-label="Estados" className="mb-4 flex flex-wrap gap-2">
        {[["", `Todas (${total})`], ...ORDER_STATUSES.map((s) => [s, `${STATUS_LABEL[s]} (${counts[s] ?? 0})`])].map(([value, label]) => (
          <Link
            key={value || "all"}
            href={href({ estado: value, p: "" })}
            aria-current={status === value ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${status === value ? "bg-primary-dark text-white" : "bg-white text-ink ring-1 ring-[#d7dee6] hover:bg-product-bg"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <form method="get" className="mb-4 flex flex-wrap gap-2">
        {status && <input type="hidden" name="estado" value={status} />}
        <div className="min-w-[220px] flex-1">
          <Input name="q" defaultValue={q} placeholder="Buscar por número, nombre o correo" aria-label="Buscar" />
        </div>
        <button type="submit" className={btnGhost}>
          Buscar
        </button>
      </form>

      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Orden</th>
              <th className={table.th}>Fecha</th>
              <th className={table.th}>Cliente</th>
              <th className={table.th}>Estado</th>
              <th className={table.th}>Total</th>
              <th className={table.th}>Entrega</th>
            </tr>
          </thead>
          <tbody>
            {list.items.length === 0 && (
              <tr>
                <td className={table.td} colSpan={6}>
                  No hay órdenes con ese filtro.
                </td>
              </tr>
            )}
            {list.items.map((o) => (
              <tr key={o.id}>
                <td className={table.td}>
                  <Link href={`/admin/ordenes/${o.number}/`} className="font-semibold text-heading-dark hover:underline">
                    #{o.number}
                  </Link>
                </td>
                <td className={table.td}>{formatDate(o.created)}</td>
                <td className={table.td}>
                  {o.expand?.user?.name || "—"}
                  <p className="text-xs text-slate">{o.expand?.user?.email}</p>
                </td>
                <td className={table.td}>
                  <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                </td>
                <td className={table.td}>
                  <span className="font-semibold">{formatUsd(o.total_usd)}</span>
                  <p className="text-xs text-slate">{formatBs(o.total_bs)}</p>
                </td>
                <td className={table.td}>
                  {o.zone_name || "—"}
                  {o.tracking && <p className="text-xs text-slate">Guía {o.tracking}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate">
        <p>
          {list.totalItems} orden(es) · página {list.page} de {Math.max(1, list.totalPages)} ({ORDERS_PER_PAGE} por página)
        </p>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={href({ p: String(page - 1) })} className={btnGhost}>
              ← Anterior
            </Link>
          )}
          {page < list.totalPages && (
            <Link href={href({ p: String(page + 1) })} className={btnGhost}>
              Siguiente →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
