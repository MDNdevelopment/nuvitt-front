import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/admin/data";
import { formatBs, formatDate } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Ajustes y tasa" };

export default async function SettingsPage() {
  const { token } = await requireAdmin();
  const s = await getSettings(token);
  const manual = s.rate_override > 0;
  const effective = manual ? s.rate_override : s.bcv_rate;
  return (
    <>
      <PageHeader title="Ajustes y tasa" subtitle="Tasa de cambio, envío gratis y datos del comercio para cobrar." />
      <Card className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate">Tasa que se cobra hoy</p>
        <p className="mt-1 font-raleway text-3xl font-bold text-heading-dark">{effective > 0 ? formatBs(effective) : "Sin tasa"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate">
          <Badge tone={manual ? "amber" : "green"}>{manual ? "Manual" : "Automática"}</Badge>
          <span>
            Automática: {s.bcv_rate > 0 ? formatBs(s.bcv_rate) : "aún no disponible"} · {s.bcv_source || "sin fuente"} · actualizada {formatDate(s.bcv_updated_at)}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate">La tasa automática se actualiza sola cada hora y cada orden guarda la tasa del momento de la compra.</p>
      </Card>
      <SettingsForm settings={s} />
    </>
  );
}
