"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { buttonClass } from "@/lib/ui";
import { saveSettings, type FormState } from "@/app/admin/(panel)/settings/actions";
import { Card, Field, inputClass } from "./ui";

type FieldDef = { key: string; label: string; multiline: boolean };

export function SettingsForm({ fields, values }: { fields: readonly FieldDef[]; values: Record<string, string> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, {});
  const contacts = fields.filter((f) => !f.multiline);
  const texts = fields.filter((f) => f.multiline);

  return (
    <form action={action} className="space-y-6">
      <Card title="Контакты" description="Telegram — куда покупатели отправляют заказы. Остальное показывается в подвале сайта.">
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={f.key}>
              <input id={f.key} name={f.key} defaultValue={values[f.key]} className={inputClass} />
            </Field>
          ))}
        </div>
      </Card>
      <Card title="Тексты на сайте">
        <div className="grid gap-4 md:grid-cols-2">
          {texts.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={f.key}>
              <textarea id={f.key} name={f.key} rows={4} defaultValue={values[f.key]} className={inputClass} />
            </Field>
          ))}
        </div>
      </Card>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass("primary", "lg")}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Сохранить настройки
        </button>
        {state.ok && <span className="text-sm font-semibold text-mint">Сохранено ✓</span>}
        {state.error && <span className="text-sm font-semibold text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
