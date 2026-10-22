"use client";

import { useState } from "react";
import { ImageListInput } from "./MediaInput";

/** Media list for a plain (server action) form: keeps the URLs in repeated hidden inputs. */
export function CardMediaField({ name, defaultValue }: { name: string; defaultValue: string[] }) {
  const [urls, setUrls] = useState(defaultValue);
  return (
    <>
      {urls.map((url, i) => (
        <input key={`${url}-${i}`} type="hidden" name={name} value={url} />
      ))}
      <ImageListInput
        value={urls}
        onChange={setUrls}
        accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
        hint="Вертикальные фото 4:5 — несколько будут плавно сменяться. Или одно видео mp4 (первым в списке)."
      />
    </>
  );
}
