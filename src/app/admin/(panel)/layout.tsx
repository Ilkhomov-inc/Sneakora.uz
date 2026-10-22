import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const newOrders = await db.order.count({ where: { status: "NEW" } });
  return <AdminShell newOrders={newOrders}>{children}</AdminShell>;
}
