"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ChevronDown, ChevronUp, Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { COLOR_FAMILIES } from "@/lib/colors";
import { GENDER_LABEL } from "@/lib/admin-format";
import { slugify } from "@/lib/slug";
import { ADULT_SIZES, KIDS_SIZES } from "@/lib/sizes";
import { buttonClass } from "@/lib/ui";
import type { Gender } from "@/lib/types";
import { deleteProduct, saveProduct, type ProductInput } from "@/app/admin/(panel)/products/actions";
import { ImageListInput } from "./MediaInput";
import { Card, Field, inputClass, Toggle } from "./ui";

type VariantDraft = {
  key: string;
  id?: string;
  sku: string;
  colorNameRu: string;
  colorNameUz: string;
  colorFamily: string;
  colorHex: string;
  images: string[];
  sizes: Record<string, number>;
};

export type ProductDraft = {
  id?: string;
  name: string;
  slug: string;
  brandId: string;
  gender: Gender;
  price: string;
  salePrice: string;
  descriptionRu: string;
  descriptionUz: string;
  isNew: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  variants: VariantDraft[];
};

let keySeq = 0;
const newKey = () => `v${Date.now()}-${keySeq++}`;

export function emptyVariant(): VariantDraft {
  return { key: newKey(), sku: "", colorNameRu: "", colorNameUz: "", colorFamily: "black", colorHex: "#121212", images: [], sizes: {} };
}

const digits = (v: string) => v.replace(/\D/g, "");

export function ProductForm({ initial, brands }: { initial: ProductDraft; brands: { id: string; name: string }[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const grid = draft.gender === "KIDS" ? KIDS_SIZES : ADULT_SIZES;
  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const setVariant = (key: string, patch: Partial<VariantDraft>) => {
    setSaved(false);
    setDraft((d) => ({ ...d, variants: d.variants.map((v) => (v.key === key ? { ...v, ...patch } : v)) }));
  };
  const moveVariant = (index: number, dir: -1 | 1) =>
    setDraft((d) => {
      const variants = [...d.variants];
      const j = index + dir;
      if (j < 0 || j >= variants.length) return d;
      [variants[index], variants[j]] = [variants[j], variants[index]];
      return { ...d, variants };
    });

  const submit = () => {
    setError(null);
    const payload: ProductInput = {
      id: draft.id,
      name: draft.name,
      slug: draft.slug,
      brandId: draft.brandId,
      gender: draft.gender,
      price: Number(digits(draft.price)) || 0,
      salePrice: digits(draft.salePrice) ? Number(digits(draft.salePrice)) : null,
      descriptionRu: draft.descriptionRu,
      descriptionUz: draft.descriptionUz,
      isNew: draft.isNew,
      isFeatured: draft.isFeatured,
      isPublished: draft.isPublished,
      variants: draft.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        colorNameRu: v.colorNameRu,
        colorNameUz: v.colorNameUz,
        colorFamily: v.colorFamily,
        colorHex: v.colorHex,
        images: v.images,
        sizes: Object.fromEntries(Object.entries(v.sizes).filter(([size]) => grid.includes(size))),
      })),
    };
    startTransition(async () => {
      const result = await saveProduct(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!draft.id) {
        router.replace(`/admin/products/${result.id}`);
        return;
      }
      // Newly added colourways get their database ids, so the next save updates instead of duplicating them.
      setDraft((d) => ({ ...d, variants: d.variants.map((v, i) => ({ ...v, id: result.variantIds[i] ?? v.id })) }));
      setSaved(true);
    });
  };

  const remove = () => {
    if (!draft.id || !confirm(`Удалить «${draft.name}»? Заказы с этим товаром сохранятся.`)) return;
    startTransition(async () => {
      await deleteProduct(draft.id!);
      router.replace("/admin/products");
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card title="Основное">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Название модели" htmlFor="name" className="sm:col-span-2" hint="Без бренда: «Air Force 1 '07», а не «Nike Air Force 1 '07»">
                <input
                  id="name"
                  value={draft.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!slugTouched) set("slug", slugify(`${brands.find((b) => b.id === draft.brandId)?.name ?? ""} ${e.target.value}`));
                  }}
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Бренд" htmlFor="brand">
                <select
                  id="brand"
                  value={draft.brandId}
                  onChange={(e) => {
                    set("brandId", e.target.value);
                    if (!slugTouched) set("slug", slugify(`${brands.find((b) => b.id === e.target.value)?.name ?? ""} ${draft.name}`));
                  }}
                  className={inputClass}
                  required
                >
                  <option value="">— выберите —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Для кого" htmlFor="gender" hint="Унисекс показывается и у мужчин, и у женщин">
                <select id="gender" value={draft.gender} onChange={(e) => set("gender", e.target.value as Gender)} className={inputClass}>
                  {(Object.keys(GENDER_LABEL) as Gender[]).map((g) => (
                    <option key={g} value={g}>
                      {GENDER_LABEL[g]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Адрес страницы" htmlFor="slug" className="sm:col-span-2" hint={`sneakora.uz/t/${draft.slug || "…"}`}>
                <input
                  id="slug"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  className={inputClass}
                />
              </Field>
            </div>
          </Card>

          <Card title="Описание" description="Показывается на странице товара. Если UZ пустое — будет показан русский текст.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Русский" htmlFor="descRu">
                <textarea id="descRu" rows={6} value={draft.descriptionRu} onChange={(e) => set("descriptionRu", e.target.value)} className={inputClass} />
              </Field>
              <Field label="O‘zbekcha" htmlFor="descUz">
                <textarea id="descUz" rows={6} value={draft.descriptionUz} onChange={(e) => set("descriptionUz", e.target.value)} className={inputClass} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Цена, сум">
            <div className="space-y-4">
              <Field label="Цена" htmlFor="price">
                <input id="price" inputMode="numeric" value={draft.price} onChange={(e) => set("price", digits(e.target.value))} className={inputClass} required />
              </Field>
              <Field label="Цена со скидкой" htmlFor="salePrice" hint="Заполните — и товар попадёт в «Распродажу»">
                <input id="salePrice" inputMode="numeric" value={draft.salePrice} onChange={(e) => set("salePrice", digits(e.target.value))} className={inputClass} />
              </Field>
            </div>
          </Card>
          <Card title="Показ на сайте">
            <div className="space-y-4">
              <Toggle label="Опубликован" checked={draft.isPublished} onChange={(v) => set("isPublished", v)} />
              <Toggle label="Новинка" checked={draft.isNew} onChange={(v) => set("isNew", v)} />
              <Toggle label="Хит (на главной)" checked={draft.isFeatured} onChange={(v) => set("isFeatured", v)} />
            </div>
          </Card>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Расцветки и размеры</h2>
          <p className="mt-1 text-sm text-stone">
            У каждой расцветки свои фото и остатки по размерам ({draft.gender === "KIDS" ? "детская" : "взрослая"} сетка EU). Пустое поле — размера нет, 0 — закончился.
          </p>
        </div>
      </div>

      {draft.variants.map((v, index) => (
        <Card key={v.key}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">
              Расцветка {index + 1}
              {v.colorNameRu && <span className="font-normal text-stone"> · {v.colorNameRu}</span>}
            </p>
            <div className="flex gap-1">
              <IconButton label="Выше" onClick={() => moveVariant(index, -1)} disabled={index === 0}>
                <ChevronUp className="size-4" />
              </IconButton>
              <IconButton label="Ниже" onClick={() => moveVariant(index, 1)} disabled={index === draft.variants.length - 1}>
                <ChevronDown className="size-4" />
              </IconButton>
              <IconButton
                label="Копировать"
                onClick={() => set("variants", [...draft.variants, { ...v, key: newKey(), id: undefined, sku: `${v.sku}-copy`, images: [] }])}
              >
                <Copy className="size-4" />
              </IconButton>
              <IconButton
                label="Удалить расцветку"
                onClick={() => set("variants", draft.variants.filter((x) => x.key !== v.key))}
                disabled={draft.variants.length === 1}
                danger
              >
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Артикул" htmlFor={`sku-${v.key}`}>
              <input id={`sku-${v.key}`} value={v.sku} onChange={(e) => setVariant(v.key, { sku: e.target.value })} className={inputClass} required />
            </Field>
            <Field label="Цвет (RU)" htmlFor={`cru-${v.key}`}>
              <input id={`cru-${v.key}`} value={v.colorNameRu} onChange={(e) => setVariant(v.key, { colorNameRu: e.target.value })} className={inputClass} required />
            </Field>
            <Field label="Цвет (UZ)" htmlFor={`cuz-${v.key}`}>
              <input id={`cuz-${v.key}`} value={v.colorNameUz} onChange={(e) => setVariant(v.key, { colorNameUz: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Кружок цвета" htmlFor={`hex-${v.key}`}>
              <div className="flex gap-2">
                <input
                  id={`hex-${v.key}`}
                  type="color"
                  value={v.colorHex}
                  onChange={(e) => setVariant(v.key, { colorHex: e.target.value.toUpperCase() })}
                  className="h-[46px] w-14 cursor-pointer rounded-xl border border-line bg-white p-1"
                />
                <input value={v.colorHex} onChange={(e) => setVariant(v.key, { colorHex: e.target.value })} className={inputClass} aria-label="HEX" />
              </div>
            </Field>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold">Цвет для фильтра каталога</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_FAMILIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setVariant(v.key, { colorFamily: c.key })}
                  className={clsx(
                    "flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs font-semibold",
                    v.colorFamily === c.key ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                  )}
                >
                  <span className="size-3.5 rounded-full ring-1 ring-line" style={{ background: c.hex }} />
                  {c.ru}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Фото</p>
            <ImageListInput value={v.images} onChange={(images) => setVariant(v.key, { images })} />
          </div>

          <SizeStock grid={grid} sizes={v.sizes} onChange={(sizes) => setVariant(v.key, { sizes })} />
        </Card>
      ))}

      <button type="button" onClick={() => set("variants", [...draft.variants, emptyVariant()])} className={buttonClass("outline", "md")}>
        <Plus className="size-4" />
        Добавить расцветку
      </button>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-3xl bg-ink p-3 pl-5 text-white shadow-xl">
        <p className="min-w-0 flex-1 text-sm">
          {error ? <span className="font-semibold text-[#FFB4A8]">{error}</span> : saved ? "Сохранено ✓" : draft.id ? "Изменения не сохранены, пока вы не нажмёте «Сохранить»" : "Новый товар"}
        </p>
        {draft.id && (
          <button type="button" onClick={remove} disabled={pending} className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
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

function SizeStock({ grid, sizes, onChange }: { grid: string[]; sizes: Record<string, number>; onChange: (sizes: Record<string, number>) => void }) {
  const [bulk, setBulk] = useState("5");
  const offered = grid.filter((s) => sizes[s] !== undefined).length;
  return (
    <div className="mt-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          Остатки по размерам <span className="font-normal text-stone">· размеров в продаже: {offered}</span>
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-stone">Всем размерам:</span>
          <input value={bulk} onChange={(e) => setBulk(e.target.value.replace(/\D/g, ""))} className="w-14 rounded-lg border border-line px-2 py-1 text-center" aria-label="Количество" />
          <button type="button" onClick={() => onChange(Object.fromEntries(grid.map((s) => [s, Number(bulk) || 0])))} className="rounded-lg bg-sand px-2.5 py-1 font-semibold hover:bg-sand-deep">
            Заполнить
          </button>
          <button type="button" onClick={() => onChange({})} className="rounded-lg px-2.5 py-1 font-semibold text-stone hover:bg-sand">
            Очистить
          </button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
        {grid.map((size) => {
          const value = sizes[size];
          return (
            <label key={size} className={clsx("rounded-xl border p-1.5 text-center", value === undefined ? "border-line bg-white" : value === 0 ? "border-flame/40 bg-[#FFF3EE]" : "border-ink/30 bg-sand")}>
              <span className="block text-xs font-bold">{size}</span>
              <input
                inputMode="numeric"
                value={value ?? ""}
                placeholder="—"
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  const next = { ...sizes };
                  if (raw === "") delete next[size];
                  else next[size] = Math.min(9999, Number(raw));
                  onChange(next);
                }}
                className="mt-1 w-full rounded-md bg-transparent text-center text-sm outline-none"
                aria-label={`Остаток, размер ${size}`}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={clsx("flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-sand disabled:opacity-30", danger && "text-danger")}
    >
      {children}
    </button>
  );
}
