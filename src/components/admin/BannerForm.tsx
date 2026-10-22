"use client";

import { useActionState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { buttonClass } from "@/lib/ui";
import { deleteBanner, saveBanner, type FormState } from "@/app/admin/(panel)/banners/actions";
import { SingleMediaInput } from "./MediaInput";
import { Card, Field, inputClass, Toggle } from "./ui";

export type BannerDraft = {
  id?: string;
  placement: "HERO" | "PROMO";
  mediaUrl: string;
  mediaUrlMobile: string | null;
  posterUrl: string | null;
  posterUrlMobile: string | null;
  eyebrowRu: string | null;
  eyebrowUz: string | null;
  titleRu: string | null;
  titleUz: string | null;
  textRu: string | null;
  textUz: string | null;
  ctaLabelRu: string | null;
  ctaLabelUz: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
};

const TEXT_FIELDS = [
  { key: "eyebrow", label: "Надзаголовок", rows: 0 },
  { key: "title", label: "Заголовок", rows: 0 },
  { key: "text", label: "Текст", rows: 3 },
  { key: "ctaLabel", label: "Текст кнопки", rows: 0 },
] as const;

export function BannerForm({ banner }: { banner: BannerDraft }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveBanner, {});
  const [deleting, startDelete] = useTransition();

  return (
    <form action={action} className="space-y-6">
      {banner.id && <input type="hidden" name="id" value={banner.id} />}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card title="Медиа" description="Фото или видео mp4. Для мобильных можно загрузить отдельную вертикальную версию.">
            <div className="space-y-5">
              <Field label="Основное (компьютер)">
                <SingleMediaInput name="mediaUrl" defaultValue={banner.mediaUrl} accept="image/*,video/mp4,video/webm" hint="Фото от 1920 px по ширине или видео mp4" />
              </Field>
              <Field label="Для телефона (необязательно)">
                <SingleMediaInput name="mediaUrlMobile" defaultValue={banner.mediaUrlMobile} accept="image/*,video/mp4,video/webm" />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Обложка видео">
                  <SingleMediaInput name="posterUrl" defaultValue={banner.posterUrl} />
                </Field>
                <Field label="Обложка видео для телефона">
                  <SingleMediaInput name="posterUrlMobile" defaultValue={banner.posterUrlMobile} />
                </Field>
              </div>
            </div>
          </Card>
          <Card title="Тексты" description="Пустые поля не показываются. Если UZ пустое — будет показан русский текст.">
            <div className="grid gap-4 md:grid-cols-2">
              {TEXT_FIELDS.flatMap((f) =>
                (["Ru", "Uz"] as const).map((lang) => {
                  const name = `${f.key}${lang}` as const;
                  const value = banner[name] ?? "";
                  return (
                    <Field key={name} label={`${f.label} (${lang.toUpperCase()})`} htmlFor={name}>
                      {f.rows ? (
                        <textarea id={name} name={name} rows={f.rows} defaultValue={value} className={inputClass} />
                      ) : (
                        <input id={name} name={name} defaultValue={value} className={inputClass} />
                      )}
                    </Field>
                  );
                }),
              )}
              <Field label="Ссылка кнопки" htmlFor="ctaHref" className="md:col-span-2" hint="Например: /brand/nike, /w?sale=1, /w?gender=women">
                <input id="ctaHref" name="ctaHref" defaultValue={banner.ctaHref ?? ""} className={inputClass} />
              </Field>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Где показывать">
            <div className="space-y-4">
              <Field label="Место" htmlFor="placement">
                <select id="placement" name="placement" defaultValue={banner.placement} className={inputClass}>
                  <option value="HERO">Слайдер вверху главной</option>
                  <option value="PROMO">Промо-блок внизу главной</option>
                </select>
              </Field>
              <Field label="Порядок" htmlFor="sortOrder" hint="Меньше — раньше">
                <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={banner.sortOrder} className={inputClass} />
              </Field>
              <Toggle name="isActive" label="Показывать" defaultChecked={banner.isActive} />
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-3xl bg-ink p-3 pl-5 text-white shadow-xl">
        <p className="min-w-0 flex-1 text-sm">{state.error ? <span className="font-semibold text-[#FFB4A8]">{state.error}</span> : state.ok ? "Сохранено ✓" : ""}</p>
        {banner.id && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => confirm("Удалить баннер?") && startDelete(() => deleteBanner(banner.id!))}
            className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
          >
            Удалить
          </button>
        )}
        <button type="submit" disabled={pending} className={buttonClass("light", "md")}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Сохранить
        </button>
      </div>
    </form>
  );
}
