import Link from "next/link";

// El segmento no conoce el idioma de la URL, por eso el mensaje es bilingüe.
export default function NotFound() {
  return (
    <section className="bg-paper py-24 text-center">
      <div className="container-nv">
        <p className="font-raleway text-[80px] font-bold leading-none text-primary">404</p>
        <h1 className="mt-4 font-raleway text-3xl font-bold text-heading-deep">
          Página no encontrada
        </h1>
        <p className="mt-2 text-body">La página que buscas no existe o fue movida.</p>
        <h2 className="mt-8 font-raleway text-2xl font-bold text-heading-deep">Page not found</h2>
        <p className="mt-2 text-body">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn">
            Volver al inicio
          </Link>
          <Link href="/en/" className="btn">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
