"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { buttonClass } from "@/lib/ui";
import { useCart } from "@/stores/cart";
import { TelegramIcon } from "../TelegramIcon";
import type { LineStatus } from "./CartView";

const CONTACT_KEY = "sneakora-contact";

type Contact = { name: string; phone: string };

function savedContact(): Contact {
  try {
    return { name: "", phone: "+998 ", ...JSON.parse(localStorage.getItem(CONTACT_KEY) ?? "{}") };
  } catch {
    return { name: "", phone: "+998 " };
  }
}

export function CheckoutForm({ onStockProblem }: { onStockProblem: (lines: LineStatus[]) => void }) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [initial] = useState(savedContact);
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean; form?: string }>({});
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const digits = phone.replace(/\D/g, "");
    const nextErrors = { name: name.length < 2, phone: digits.length < 9 || digits.length > 15 };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.phone) return;

    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          phone,
          comment: String(form.get("comment") ?? ""),
          website: String(form.get("website") ?? ""),
          locale,
          items: items.map((i) => ({ variantId: i.variantId, size: i.size, quantity: i.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        try {
          localStorage.setItem(CONTACT_KEY, JSON.stringify({ name, phone }));
        } catch {}
        router.replace(`/order/${data.token}`);
        clear();
        return;
      }
      if (res.status === 409 && data.lines) {
        onStockProblem(data.lines);
        setErrors({ form: t("errorStock") });
      } else if (res.status === 429) {
        setErrors({ form: t("errorRate") });
      } else if (res.status === 400 && Array.isArray(data.fields)) {
        setErrors({ name: data.fields.includes("customerName"), phone: data.fields.includes("phone"), form: t("errorGeneric") });
      } else {
        setErrors({ form: t("errorGeneric") });
      }
    } catch {
      setErrors({ form: t("errorGeneric") });
    }
    setSending(false);
  };

  const field =
    "mt-1.5 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-stone/60 focus:border-ink";

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-4">
      <div>
        <label htmlFor="checkout-name" className="text-sm font-semibold">
          {t("name")}
        </label>
        <input
          id="checkout-name"
          name="name"
          defaultValue={initial.name}
          autoComplete="name"
          maxLength={80}
          placeholder={t("namePlaceholder")}
          className={`${field} ${errors.name ? "border-danger" : "border-line"}`}
          aria-invalid={errors.name}
        />
        {errors.name && <p className="mt-1 text-sm text-danger">{t("errorName")}</p>}
      </div>
      <div>
        <label htmlFor="checkout-phone" className="text-sm font-semibold">
          {t("phone")}
        </label>
        <input
          id="checkout-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={initial.phone}
          autoComplete="tel"
          maxLength={25}
          className={`${field} ${errors.phone ? "border-danger" : "border-line"}`}
          aria-invalid={errors.phone}
        />
        {errors.phone && <p className="mt-1 text-sm text-danger">{t("errorPhone")}</p>}
      </div>
      <div>
        <label htmlFor="checkout-comment" className="text-sm font-semibold">
          {t("comment")}
        </label>
        <textarea id="checkout-comment" name="comment" rows={2} maxLength={500} placeholder={t("commentPlaceholder")} className={`${field} border-line resize-none`} />
      </div>
      {/* Honeypot for bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {errors.form && <p className="rounded-2xl bg-white p-3 text-sm font-semibold text-danger">{errors.form}</p>}

      <button type="submit" disabled={sending} className={buttonClass("primary", "lg", "w-full")}>
        {sending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <TelegramIcon className="size-5" />}
        {sending ? t("sending") : t("submit")}
      </button>
      <p className="text-xs leading-relaxed text-stone">{t("privacy")}</p>
    </form>
  );
}
