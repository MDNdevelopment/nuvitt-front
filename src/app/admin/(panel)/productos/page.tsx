import type { Metadata } from "next";
import Link from "next/link";
import { toggleProductAction } from "@/lib/admin/actions/products";
import { getShopConfig, listProducts, mediaUrl, productPhotoUrl } from "@/lib/admin/data";
import { formatBs, formatUsd } from "@/lib/admin/format";
import { requireStaff } from "@/lib/admin/session";
import { Badge, btnGhost, btnPrimary, Input, PageHeader, Select, table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Productos" };

type Props = { searchParams: Promise<{ q?: string; estado?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const { token } = await requireStaff();
  const { q = "", estado = "" } = await searchParams;
  const active = estado === "1" || estado === "0" ? estado : "";
  const [products, config] = await Promise.all([
    listProducts(token, { search: q.trim(), active }),
    getShopConfig().catch(() => null),
  ]);
  const rate = config?.rate ?? 0;

  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Precios en USD; el equivalente en Bs usa la tasa vigente."
        actions={
          <Link href="/admin/productos/nuevo/" className={btnPrimary}>
            Nuevo producto
          </Link>
        }
      />

      <form method="get" className="mb-4 flex flex-wrap gap-2">
        <div className="min-w-[200px] flex-1">
          <Input name="q" defaultValue={q} placeholder="Buscar por nombre o SKU" aria-label="Buscar" />
        </div>
        <div className="w-[170px]">
          <Select name="estado" defaultValue={active} aria-label="Estado">
            <option value="">Todos</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
          </Select>
        </div>
        <button type="submit" className={btnGhost}>
          Filtrar
        </button>
      </form>

      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Producto</th>
              <th className={table.th}>Precio</th>
              <th className={table.th}>Stock</th>
              <th className={table.th}>Estado</th>
              <th className={table.th} />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td className={table.td} colSpan={5}>
                  No hay productos con ese filtro.
                </td>
              </tr>
            )}
            {products.map((p) => {
              const src = mediaUrl(p, p.shared?.media?.bottle?.ref, "100x100") ?? (p.photos[0] ? productPhotoUrl(p, p.photos[0], "100x100") : p.image ? `/images/${p.image}` : "");
              return (
                <tr key={p.id}>
                  <td className={table.td}>
                    <div className="flex items-center gap-3">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt="" className="size-11 shrink-0 rounded bg-product-bg object-contain" />
                      ) : (
                        <span className="size-11 shrink-0 rounded bg-[#eef1f4]" />
                      )}
                      <div>
                        <Link href={`/admin/productos/${p.id}/`} className="font-semibold text-heading-dark hover:underline">
                          {p.name_es}
                        </Link>
                        <p className="text-xs text-slate">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className={table.td}>
                    {p.price_usd > 0 ? (
                      <>
                        <span className="font-semibold">{formatUsd(p.price_usd)}</span>
                        {rate > 0 && <p className="text-xs text-slate">{formatBs(p.price_usd * rate)}</p>}
                      </>
                    ) : (
                      <Badge tone="amber">Sin precio</Badge>
                    )}
                  </td>
                  <td className={table.td}>
                    <span className={p.stock === 0 ? "font-semibold text-[#c62828]" : p.stock <= 5 ? "font-semibold text-[#a96400]" : ""}>{p.stock}</span>
                  </td>
                  <td className={table.td}>
                    <form action={toggleProductAction.bind(null, p.id)}>
                      <input type="hidden" name="next" value={String(!p.active)} />
                      <button type="submit" className="cursor-pointer" title={p.active ? "Clic para desactivar" : "Clic para activar"}>
                        <Badge tone={p.active ? "green" : "gray"}>{p.active ? "Activo" : "Inactivo"}</Badge>
                      </button>
                    </form>
                  </td>
                  <td className={`${table.td} text-right`}>
                    <Link href={`/admin/productos/${p.id}/`} className={btnGhost}>
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate">{products.length} producto(s).</p>
    </>
  );
}
