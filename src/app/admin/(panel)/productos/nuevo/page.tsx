import type { Metadata } from "next";
import Link from "next/link";
import ProductEditor from "@/components/admin/ProductEditor";
import { PageHeader, btnGhost } from "@/components/admin/ui";
import { listProducts } from "@/lib/admin/data";
import { requireStaff } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const { token } = await requireStaff();
  const options = (await listProducts(token)).map((p) => ({ slug: p.slug, name: p.name_es }));
  return (
    <>
      <PageHeader
        title="Nuevo producto"
        actions={
          <Link href="/admin/productos/" className={btnGhost}>
            Volver
          </Link>
        }
      />
      <ProductEditor urls={{}} options={options} />
    </>
  );
}
