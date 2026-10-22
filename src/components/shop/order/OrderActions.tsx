"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { buttonClass } from "@/lib/ui";
import { TelegramIcon } from "../TelegramIcon";

export function OrderActions({ telegramUrl, message }: { telegramUrl: string | null; message: string }) {
  const t = useTranslations("order");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      {telegramUrl && (
        <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("accent", "lg")}>
          <TelegramIcon className="size-5" />
          {t("sendTelegram")}
        </a>
      )}
      <button type="button" onClick={copy} className={buttonClass("outline", "lg")}>
        {copied ? <Check className="size-5 text-mint" aria-hidden /> : <Copy className="size-5" aria-hidden />}
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}
