"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export type FormState = { ok?: boolean; error?: string };

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["NEW", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"]),
  adminNote: z.string().trim().max(2000),
});

export async function updateOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    adminNote: formData.get("adminNote") ?? "",
  });
  if (!parsed.success) return { error: "Проверьте поля" };
  const { id, status, adminNote } = parsed.data;
  await db.order.update({ where: { id }, data: { status, adminNote: adminNote || null } });
  revalidatePath("/admin", "layout");
  return { ok: true };
}
