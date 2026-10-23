import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { getSettings, getShopConfig, listCoupons, listOrders, listProducts, listZones, orderCounts } from "@/lib/admin/data";
import { formatBs, formatDate, formatUsd } from "@/lib/admin/format";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/admin/order-flow";
import { requireStaff } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Resumen" };

type Item = { ok: boolean; label: string; href: string; adminOnly?: boolean };

export default async function DashboardPage() {
  const { token, user } = await requireStaff();
  const isAdmin = user.role === "admin";

  const [products, config, zones, coupons, settings, counts, recent] = await Promise.all([
    listProducts(token),
    getShopConfig().catch(() => null),
    isAdmin ? listZones(token) : Promise.resolve(null),
    isAdmin ? listCoupons(token) : Promise.resolve(null),
    isAdmin ? getSettings(token) : Promise.resolve(null),
    orderCounts(token).catch(() => null),
    listOrders(token, { page: 1 }).then((r) => r.items.slice(0, 5)).catch(() => []),
  ]);

  const active = products.filter((p) => p.active);
  const noPrice = products.filter((p) => !(p.price_usd > 0));
  const lowStock = active.filter((p) => p.stock <= 5);

  const checklist: Item[] = [
    { ok: noPrice.length === 0, label: noPrice.length ? `${noPrice.length} producto(s) sin precio` : "Todos los productos tienen precio", href: "/admin/productos/" },
    { ok: active.length > 0, label: active.length ? `${active.length} producto(s) activos en la tienda` : "Ningún producto está activo todavía", href: "/admin/productos/" },
  ];
  if (isAdmin && zones && settings) {
    checklist.push(
      { ok: zones.some((z) => z.active), label: zones.some((z) => z.active) ? "Hay zonas de envío activas" : "No hay zonas de envío activas", href: "/admin/zonas/" },
      { ok: !!settings.merchant_phone, label: settings.merchant_phone ? "Teléfono cobrador configurado" : "Falta el teléfono cobrador", href: "/admin/ajustes/" },
      { ok: !!settings.merchant_rif, label: settings.merchant_rif ? "RIF del comercio configurado" : "Falta el RIF del comercio", href: "/admin/ajustes/" },
    );
  }
  checklist.push({
    ok: !!config?.payments_enabled,
    label: config?.payments_enabled ? "Pagos con Banco Plaza habilitados" : "Pagos con Banco Plaza deshabilitados (faltan credenciales del banco o el teléfono cobrador)",
    href: isAdmin ? "/admin/ajustes/" : "/admin/",
  });

  const stats = [
    { label: "Productos activos", value: `${active.length} / ${products.length}` },
    { label: "Stock bajo (≤ 5)", value: String(lowStock.length) },
    ...(counts ? [{ label: "Órdenes por atender", value: String((counts.pagada ?? 0) + (counts.en_preparacion ?? 0) + (counts.por_verificar ?? 0)) }] : []),
    ...(zones ? [{ label: "Zonas activas", value: String(zones.filter((z) => z.active).length) }] : []),
    ...(coupons ? [{ label: "Cupones activos", value: String(coupons.filter((c) => c.active).length) }] : []),
  ];

  return (
    <>
      <PageHeader title={`Hola${user.name ? `, ${user.name.split(" ")[0]}` : ""}`} subtitle="Estado de la tienda y lo que falta para empezar a vender." />

      {counts && counts.por_verificar > 0 && (
        <Link href="/admin/ordenes/?estado=por_verificar" className="mb-5 block rounded-md bg-[#fff4e0] px-4 py-3 text-sm font-semibold text-[#a96400] hover:underline">
          Hay {counts.por_verificar} orden(es) con el pago por verificar. Revísalas →
        </Link>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="!p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate">{s.label}</p>
            <p className="mt-1 font-raleway text-2xl font-bold text-heading-dark">{s.value}</p>
          </Card>
        ))}
      </div>

      {recent.length > 0 && (
        <Card className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-raleway text-lg font-bold text-heading-dark">Últimas órdenes</h2>
            <Link href="/admin/ordenes/" className="text-sm font-semibold text-primary-dark hover:underline">
              Ver todas
            </Link>
          </div>
          <ul className="divide-y divide-[#eef1f4]">
            {recent.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <Link href={`/admin/ordenes/${o.number}/`} className="font-semibold text-heading-dark hover:underline">
                  #{o.number}
                </Link>
                <span className="text-slate">{o.expand?.user?.name || o.expand?.user?.email}</span>
                <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                <span className="font-semibold">{formatUsd(o.total_usd)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Puesta en marcha</h2>
          <ul className="space-y-2.5">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-start gap-3 text-sm">
                <span aria-hidden className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${c.ok ? "bg-accent" : "bg-[#e0a030]"}`}>
                  {c.ok ? "✓" : "!"}
                </span>
                <Link href={c.href} className="text-ink hover:text-primary-dark hover:underline">
                  <span className="sr-only">{c.ok ? "Listo: " : "Pendiente: "}</span>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-2 font-raleway text-lg font-bold text-heading-dark">Tasa vigente</h2>
            {config && config.rate > 0 ? (
              <>
                <p className="font-raleway text-2xl font-bold text-heading-dark">{formatBs(config.rate)}</p>
                <p className="text-xs text-slate">por USD · actualizada {formatDate(config.rate_updated_at)}</p>
              </>
            ) : (
              <Badge tone="amber">Sin tasa disponible</Badge>
            )}
          </Card>
          {lowStock.length > 0 && (
            <Card>
              <h2 className="mb-2 font-raleway text-lg font-bold text-heading-dark">Stock bajo</h2>
              <ul className="space-y-1.5 text-sm">
                {lowStock.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <Link href={`/admin/productos/${p.id}/`} className="text-ink hover:underline">
                      {p.name_es}
                    </Link>
                    <span className={p.stock === 0 ? "font-semibold text-[#c62828]" : "font-semibold text-[#a96400]"}>{p.stock}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
