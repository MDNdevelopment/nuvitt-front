import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditUserForm } from "@/components/admin/UserForms";
import { Badge, btnGhost, Card, Flash, PageHeader } from "@/components/admin/ui";
import { getUser, listUserOrders } from "@/lib/admin/data";
import { formatBs, formatDate, formatUsd } from "@/lib/admin/format";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/admin/order-flow";
import { PBError } from "@/lib/pb";
import { requireAdmin } from "@/lib/admin/session";
import type { UserRecord } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Usuario" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string }> };

export default async function UserDetailPage({ params, searchParams }: Props) {
  const { token, user: me } = await requireAdmin();
  const { id } = await params;
  const flags = await searchParams;
  let user: UserRecord;
  try {
    user = await getUser(token, id);
  } catch (e) {
    if (e instanceof PBError && e.status === 404) notFound();
    throw e;
  }
  const orders = await listUserOrders(token, id).catch(() => []);

  return (
    <>
      <PageHeader
        title={user.name || user.email}
        subtitle={`Registrado el ${formatDate(user.created)}`}
        actions={
          <Link href="/admin/usuarios/" className={btnGhost}>
            Volver
          </Link>
        }
      />
      {flags.creado && (
        <div className="mb-4">
          <Flash ok message="Usuario creado. Compártele su correo y la clave inicial." />
        </div>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
        <EditUserForm user={user} self={user.id === me.id} />
        <Card>
          <h2 className="mb-3 font-raleway text-lg font-bold text-heading-dark">Pedidos</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-slate">Sin pedidos.</p>
          ) : (
            <ul className="divide-y divide-[#eef1f4]">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <Link href={`/admin/ordenes/${o.number}/`} className="font-semibold text-heading-dark hover:underline">
                    #{o.number}
                  </Link>
                  <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                  <span className="text-right">
                    <span className="font-semibold">{formatUsd(o.total_usd)}</span>
                    <span className="block text-xs text-slate">{formatBs(o.total_bs)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
