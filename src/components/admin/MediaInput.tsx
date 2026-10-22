"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Link2, Loader2, Upload, X } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { isVideoUrl } from "@/lib/media";
import { inputClass } from "./ui";

export async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Не удалось загрузить файл");
  return data.url as string;
}

function Preview({ url, className }: { url: string; className?: string }) {
  if (isVideoUrl(url)) {
    return (
      <div className={clsx("flex items-center justify-center bg-ink text-xs font-semibold text-white", className)}>
        {/\.(mp4|webm)(\?|$)/i.test(url) ? <video src={url} muted className="h-full w-full object-cover" /> : "Видео"}
      </div>
    );
  }
  if (/\.svg(\?|$)/i.test(url)) {
    // eslint-disable-next-line @next/next/no-img-element -- SVG logos
    return <img src={url} alt="" className={clsx("object-contain p-2", className)} />;
  }
  return (
    <div className={clsx("relative", className)}>
      <SmartImage src={url} alt="" fill sizes="160px" className="object-cover" />
    </div>
  );
}

function useUploader(onUploaded: (urls: string[]) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setBusy(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of list) urls.push(await uploadFile(file));
      onUploaded(urls);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    }
    setBusy(false);
  };
  return { busy, error, upload };
}

/** Ordered list of photos (or videos): upload (button or drag & drop), add by URL, reorder, remove. */
export function ImageListInput({
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/avif,image/gif",
  hint = "Перетащите файлы в рамку или нажмите «Фото». Первое фото — главное.",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const { busy, error, upload } = useUploader((urls) => onChange([...value, ...urls]));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(e.dataTransfer.files);
        }}
        className={clsx("grid grid-cols-3 gap-2 rounded-2xl border-2 border-dashed p-2 sm:grid-cols-4 md:grid-cols-6", dragOver ? "border-cobalt bg-[#EEF1FF]" : "border-line")}
      >
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl bg-sand">
            <Preview url={url} className="absolute inset-0 h-full w-full" />
            {i === 0 && <span className="absolute left-1 top-1 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">Главное</span>}
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg bg-white/90 p-1 disabled:opacity-30" aria-label="Левее">
                <ArrowLeft className="size-3.5" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="rounded-lg bg-white/90 p-1 text-danger" aria-label="Удалить">
                <X className="size-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="rounded-lg bg-white/90 p-1 disabled:opacity-30" aria-label="Правее">
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl bg-sand text-xs font-semibold text-stone transition-colors hover:bg-sand-deep hover:text-ink"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          {busy ? "Загрузка…" : "Фото"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) upload(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="mt-2 flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" aria-hidden />
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="или вставьте ссылку на фото"
            className={clsx(inputClass, "pl-9 text-sm")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (urlDraft.trim()) onChange([...value, urlDraft.trim()]);
                setUrlDraft("");
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (urlDraft.trim()) onChange([...value, urlDraft.trim()]);
            setUrlDraft("");
          }}
          className="rounded-xl bg-sand px-3 text-sm font-semibold hover:bg-sand-deep"
        >
          Добавить
        </button>
      </div>
      <p className="mt-1 text-xs text-stone">{hint}</p>
      {error && <p className="mt-1 text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}

/** One file (logo, banner photo or video) with upload or URL. Keeps its value in a hidden input for plain forms. */
export function SingleMediaInput({
  name,
  defaultValue,
  accept = "image/*",
  hint,
  onChange,
}: {
  name: string;
  defaultValue?: string | null;
  accept?: string;
  hint?: string;
  onChange?: (url: string) => void;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (url: string) => {
    setValue(url);
    onChange?.(url);
  };
  const { busy, error, upload } = useUploader((urls) => set(urls[0]));

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-start gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-sand">
          {value ? <Preview url={value} className="absolute inset-0 h-full w-full" /> : <span className="flex h-full items-center justify-center text-xs text-stone">Нет файла</span>}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {busy ? "Загрузка…" : "Загрузить"}
            </button>
            {value && (
              <button type="button" onClick={() => set("")} className="rounded-xl bg-sand px-3 py-2 text-sm font-semibold hover:bg-sand-deep">
                Убрать
              </button>
            )}
          </div>
          <input value={value} onChange={(e) => set(e.target.value)} placeholder="или ссылка на файл" className={clsx(inputClass, "text-sm")} />
          {hint && <p className="text-xs text-stone">{hint}</p>}
          {error && <p className="text-xs font-semibold text-danger">{error}</p>}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          if (e.target.files) upload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
