import type { Metadata } from "next";
import Link from "next/link";
import { CreateUserForm } from "@/components/admin/UserForms";
import { btnGhost, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Nuevo usuario" };

export default async function NewUserPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Nuevo usuario del panel"
        subtitle="Crea una cuenta para alguien del equipo. Los clientes se registran solos en el sitio."
        actions={
          <Link href="/admin/usuarios/" className={btnGhost}>
            Volver
          </Link>
        }
      />
      <CreateUserForm />
    </>
  );
}
