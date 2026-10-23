import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/lib/admin/actions/auth";
import type { AdminUser } from "@/lib/admin/types";
import { img } from "@/lib/images";
import Sidebar, { type NavItem } from "./Sidebar";

const NAV: NavItem[] = [
  { href: "/admin/", label: "Resumen" },
  { href: "/admin/ordenes/", label: "Órdenes" },
  { href: "/admin/productos/", label: "Productos" },
  { href: "/admin/zonas/", label: "Zonas de envío", adminOnly: true },
  { href: "/admin/cupones/", label: "Cupones", adminOnly: true },
  { href: "/admin/usuarios/", label: "Usuarios", adminOnly: true },
  { href: "/admin/ajustes/", label: "Ajustes y tasa", adminOnly: true },
];

/** `pending`: órdenes que esperan acción del personal (por verificar o pagadas sin preparar). */
export default function Shell({ user, pending = 0, children }: { user: AdminUser; pending?: number; children: React.ReactNode }) {
  const items = NAV.filter((i) => !i.adminOnly || user.role === "admin").map((i) => (i.href === "/admin/ordenes/" ? { ...i, badge: pending } : i));
  const logout = (
    <form action={logoutAction}>
      <button type="submit" className="text-sm font-semibold text-primary-dark hover:underline">
        Cerrar sesión
      </button>
    </form>
  );
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-[#e1e8ee] bg-white lg:flex lg:flex-col lg:justify-between lg:p-4">
        <div>
          <div className="mb-6 px-2 pt-2">
            <Image {...img("LOGO-NUVITT-TM.webp")} alt="Nuvitt" className="h-auto w-[130px]" priority />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate">Panel de administración</p>
          </div>
          <Sidebar items={items} orientation="vertical" />
        </div>
        <div className="border-t border-[#e1e8ee] px-2 pt-4">
          <p className="truncate text-sm font-semibold text-ink">{user.name || user.email}</p>
          <p className="mb-2 text-xs text-slate">{user.role === "admin" ? "Administrador" : "Staff"}</p>
          <div className="flex items-center gap-4">
            {logout}
            <Link href="/admin/perfil/" className="text-sm font-semibold text-slate hover:text-primary-dark hover:underline">
              Mi perfil
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-[#e1e8ee] bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 pt-3">
            <Image {...img("LOGO-NUVITT-TM.webp")} alt="Nuvitt" className="h-auto w-[96px]" />
            {logout}
          </div>
          <Sidebar items={items} orientation="horizontal" />
        </header>
        <main className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
