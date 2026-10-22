"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/lib/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-display text-2xl font-semibold">{t("error")}</h1>
      <button type="button" onClick={reset} className={buttonClass("primary", "lg", "mt-8")}>
        {t("retry")}
      </button>
    </div>
  );
}
