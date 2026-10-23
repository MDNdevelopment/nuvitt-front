import type { Metadata } from "next";
import { OwnProfileForms } from "@/components/admin/UserForms";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const { user } = await requireStaff();
  return (
    <>
      <PageHeader title="Mi perfil" subtitle="Tus datos y tu clave de acceso al panel." />
      <div className="max-w-[560px]">
        <OwnProfileForms name={user.name} email={user.email} role={user.role} />
      </div>
    </>
  );
}
