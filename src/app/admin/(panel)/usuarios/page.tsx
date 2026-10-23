import type { Metadata } from "next";
import Link from "next/link";
import { Badge, btnGhost, btnPrimary, Input, PageHeader, Select, table } from "@/components/admin/ui";
import { listUsers, USERS_PER_PAGE } from "@/lib/admin/data";
import { formatDate } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Usuarios" };

type Props = { searchParams: Promise<{ rol?: string; q?: string; p?: string }> };
const ROLE: Record<string, { label: string; tone: "green" | "blue" | "gray" }> = {
  admin: { label: "Administrador", tone: "green" },
  staff: { label: "Staff", tone: "blue" },
  customer: { label: "Cliente", tone: "gray" },
};

export default async function UsersPage({ searchParams }: Props) {
  const { token } = await requireAdmin();
  const { rol = "", q = "", p = "1" } = await searchParams;
  const page = Math.max(1, parseInt(p, 10) || 1);
  const list = await listUsers(token, { role: rol, search: q, page });
  const href = (over: Record<string, string>) => {
    const sp = new URLSearchParams({ ...(rol && { rol }), ...(q && { q }), ...over });
    const s = sp.toString();
    return `/admin/usuarios/${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle="Clientes y personal del panel. El rol define qué se puede hacer en /admin."
        actions={
          <Link href="/admin/usuarios/nuevo/" className={btnPrimary}>
            Nuevo usuario del panel
          </Link>
        }
      />
      <form method="get" className="mb-4 flex flex-wrap gap-2">
        <div className="min-w-[220px] flex-1">
          <Input name="q" defaultValue={q} placeholder="Buscar por nombre, correo o cédula" aria-label="Buscar" />
        </div>
        <div className="w-[170px]">
          <Select name="rol" defaultValue={rol} aria-label="Rol">
            <option value="">Todos los roles</option>
            <option value="customer">Clientes</option>
            <option value="staff">Staff</option>
            <option value="admin">Administradores</option>
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
              <th className={table.th}>Usuario</th>
              <th className={table.th}>Rol</th>
              <th className={table.th}>Teléfono</th>
              <th className={table.th}>Registro</th>
              <th className={table.th} />
            </tr>
          </thead>
          <tbody>
            {list.items.length === 0 && (
              <tr>
                <td className={table.td} colSpan={5}>
                  No hay usuarios con ese filtro.
                </td>
              </tr>
            )}
            {list.items.map((u) => (
              <tr key={u.id}>
                <td className={table.td}>
                  <Link href={`/admin/usuarios/${u.id}/`} className="font-semibold text-heading-dark hover:underline">
                    {u.name || "—"}
                  </Link>
                  <p className="text-xs text-slate">{u.email}</p>
                </td>
                <td className={table.td}>
                  <Badge tone={ROLE[u.role]?.tone ?? "gray"}>{ROLE[u.role]?.label ?? u.role}</Badge>
                </td>
                <td className={table.td}>{u.phone || "—"}</td>
                <td className={table.td}>{formatDate(u.created)}</td>
                <td className={`${table.td} text-right`}>
                  <Link href={`/admin/usuarios/${u.id}/`} className={btnGhost}>
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate">
        <p>
          {list.totalItems} usuario(s) · página {list.page} de {Math.max(1, list.totalPages)} ({USERS_PER_PAGE} por página)
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
