import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { img } from "@/lib/images";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin/");
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[400px] rounded-xl border border-[#e1e8ee] bg-white p-7 shadow-sm">
        <Image {...img("LOGO-NUVITT-TM.webp")} alt="Nuvitt" className="mx-auto mb-2 h-auto w-[140px]" priority />
        <h1 className="mb-6 text-center font-raleway text-lg font-bold text-heading-dark">Panel de administración</h1>
        <LoginForm />
      </div>
    </main>
  );
}
