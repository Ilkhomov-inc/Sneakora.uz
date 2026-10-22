"use client";

import { useActionState, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { buttonClass } from "@/lib/ui";
import { deleteBrand, saveBrand, type FormState } from "@/app/admin/(panel)/brands/actions";
import { CardMediaField } from "./CardMediaField";
import { SingleMediaInput } from "./MediaInput";
import { Card, Field, inputClass, Toggle } from "./ui";

type Brand = {
  id?: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  bannerPosterUrl: string | null;
  cardMedia: string[];
  cardPosterUrl: string | null;
  titleRu: string | null;
  titleUz: string | null;
  textRu: string | null;
  textUz: string | null;
  sortOrder: number;
  isActive: boolean;
};

export function BrandForm({ brand }: { brand: Brand }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveBrand, {});
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  return (
    <form action={action} className="space-y-6">
      {brand.id && <input type="hidden" name="id" value={brand.id} />}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card title="Бренд">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Название" htmlFor="name">
                <input id="name" name="name" defaultValue={brand.name} className={inputClass} required />
              </Field>
              <Field label="Адрес" htmlFor="slug" hint="Латиницей: sneakora.uz/brand/…  Пусто — из названия">
                <input id="slug" name="slug" defaultValue={brand.slug} className={inputClass} />
              </Field>
            </div>
          </Card>
          <Card title="Баннер бренда" description="Широкое фото или видео (mp4) вверху страницы бренда.">
            <div className="space-y-5">
              <Field label="Фото или видео">
                <SingleMediaInput name="bannerUrl" defaultValue={brand.bannerUrl} accept="image/*,video/mp4,video/webm" hint="Фото: от 1920 px по ширине. Видео: mp4 до 150 МБ." />
              </Field>
              <Field label="Обложка видео (необязательно)">
                <SingleMediaInput name="bannerPosterUrl" defaultValue={brand.bannerPosterUrl} hint="Показывается, пока видео загружается" />
              </Field>
            </div>
          </Card>
          <Card title="Карточка на главной" description="Вертикальная карточка бренда в блоке «Бренды». Если пусто — используется баннер бренда.">
            <div className="space-y-5">
              <CardMediaField name="cardMedia" defaultValue={brand.cardMedia} />
              <Field label="Обложка видео (необязательно)">
                <SingleMediaInput name="cardPosterUrl" defaultValue={brand.cardPosterUrl} hint="Нужна, только если в карточке видео" />
              </Field>
            </div>
          </Card>
          <Card title="Тексты">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Заголовок (RU)" htmlFor="titleRu">
                <input id="titleRu" name="titleRu" defaultValue={brand.titleRu ?? ""} className={inputClass} placeholder="По умолчанию — название бренда" />
              </Field>
              <Field label="Заголовок (UZ)" htmlFor="titleUz">
                <input id="titleUz" name="titleUz" defaultValue={brand.titleUz ?? ""} className={inputClass} />
              </Field>
              <Field label="Описание (RU)" htmlFor="textRu">
                <textarea id="textRu" name="textRu" rows={3} defaultValue={brand.textRu ?? ""} className={inputClass} />
              </Field>
              <Field label="Описание (UZ)" htmlFor="textUz">
                <textarea id="textUz" name="textUz" rows={3} defaultValue={brand.textUz ?? ""} className={inputClass} />
              </Field>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Логотип" description="SVG или PNG с прозрачным фоном">
            <SingleMediaInput name="logoUrl" defaultValue={brand.logoUrl} accept="image/svg+xml,image/png,image/webp" />
          </Card>
          <Card title="Показ">
            <div className="space-y-4">
              <Toggle name="isActive" label="Показывать на сайте" defaultChecked={brand.isActive} />
              <Field label="Порядок в меню" htmlFor="sortOrder" hint="Меньше — левее">
                <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={brand.sortOrder} className={inputClass} />
              </Field>
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-3xl bg-ink p-3 pl-5 text-white shadow-xl">
        <p className="min-w-0 flex-1 text-sm">
          {state.error || deleteError ? <span className="font-semibold text-[#FFB4A8]">{state.error ?? deleteError}</span> : state.ok ? "Сохранено ✓" : ""}
        </p>
        {brand.id && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (!confirm(`Удалить бренд «${brand.name}»?`)) return;
              startDelete(async () => {
                const result = await deleteBrand(brand.id!);
                if (result?.error) setDeleteError(result.error);
              });
            }}
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
