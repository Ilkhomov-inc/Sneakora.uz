"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { ORDER_STATUS_LABEL } from "@/lib/admin-format";
import { buttonClass } from "@/lib/ui";
import { updateOrder, type FormState } from "@/app/admin/(panel)/orders/actions";
import { Field, inputClass } from "./ui";

export function OrderStatusForm({ id, status, adminNote }: { id: string; status: keyof typeof ORDER_STATUS_LABEL; adminNote: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateOrder, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <Field label="Статус" htmlFor="status">
        <select id="status" name="status" defaultValue={status} className={inputClass}>
          {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Заметка для команды" htmlFor="adminNote" hint="Видна только в админке">
        <textarea id="adminNote" name="adminNote" rows={4} defaultValue={adminNote ?? ""} className={inputClass} />
      </Field>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Сохранить
        </button>
        {state.ok && <span className="text-sm font-semibold text-mint">Сохранено ✓</span>}
        {state.error && <span className="text-sm font-semibold text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
