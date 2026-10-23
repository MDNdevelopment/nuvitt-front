import type { OrderStatusKey } from "@/lib/shop/types";

const TONE: Record<OrderStatusKey, string> = {
  pendiente_pago: "bg-[#fff4e0] text-[#a96400]",
  por_verificar: "bg-[#fff4e0] text-[#a96400]",
  pagada: "bg-[#e3f2fd] text-[#1565c0]",
  en_preparacion: "bg-[#e3f2fd] text-[#1565c0]",
  enviada: "bg-[#ede7f6] text-[#5e35b1]",
  entregada: "bg-[#e8f5e9] text-[#2e7d32]",
  cancelada: "bg-[#fdecea] text-[#c62828]",
  reembolsada: "bg-[#eef1f4] text-slate",
};

export default function OrderStatusBadge({ status, label }: { status: OrderStatusKey; label: string }) {
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${TONE[status] ?? TONE.reembolsada}`}>{label}</span>;
}
