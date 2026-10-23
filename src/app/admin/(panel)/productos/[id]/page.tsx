import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ProductEditor from "@/components/admin/ProductEditor";
import { Flash, PageHeader, btnDanger, btnGhost } from "@/components/admin/ui";
import { deleteProductAction } from "@/lib/admin/actions/products";
import { MEDIA_SLOTS } from "@/lib/admin/content";
import { getProduct, listProducts, mediaUrl } from "@/lib/admin/data";
import { PBError } from "@/lib/pb";
import { requireStaff } from "@/lib/admin/session";
import type { Product } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Editar producto" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string; incompleto?: string }> };

export default async function EditProductPage({ params, searchParams }: Props) {
  const { token, user } = await requireStaff();
  const { id } = await params;
  const flags = await searchParams;

  let product: Product;
  try {
    product = await getProduct(token, id);
  } catch (e) {
    if (e instanceof PBError && e.status === 404) notFound();
    throw e;
  }
  const urls = Object.fromEntries(
    MEDIA_SLOTS.flatMap((slot) => {
      const url = mediaUrl(product, product.shared?.media?.[slot]?.ref);
      return url ? [[slot, url]] : [];
    }),
  );
  const options = (await listProducts(token)).filter((p) => p.id !== product.id).map((p) => ({ slug: p.slug, name: p.name_es }));

  return (
    <>
      <PageHeader
        title={product.name_es}
        subtitle={`SKU ${product.sku} · /${product.slug}/`}
        actions={
          <>
            <Link href="/admin/productos/" className={btnGhost}>
              Volver
            </Link>
            {user.role === "admin" && (
              <form action={deleteProductAction.bind(null, product.id)}>
                <ConfirmButton className={btnDanger} message={`¿Eliminar "${product.name_es}"? Esta acción no se puede deshacer.`}>
                  Eliminar
                </ConfirmButton>
              </form>
            )}
          </>
        }
      />
      <div className="mb-4 space-y-2">
        {flags.creado && <Flash ok message="Producto creado." />}
        {flags.incompleto && <Flash message="No se puede activar: la ficha está incompleta. Revisa lo que falta abajo." />}
      </div>
      <ProductEditor product={product} urls={urls} options={options} />
    </>
  );
}
