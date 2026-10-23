import Shell from "@/components/admin/Shell";
import { pendingOrderCount } from "@/lib/admin/data";
import { requireStaff } from "@/lib/admin/session";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = await requireStaff();
  const pending = await pendingOrderCount(token).catch(() => 0);
  return (
    <Shell user={user} pending={pending}>
      {children}
    </Shell>
  );
}
