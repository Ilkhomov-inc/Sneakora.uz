"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { SmartImage } from "@/components/ui/SmartImage";

/** Product photos: thumbnails + large photo on desktop, swipeable strip on mobile. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const t = useTranslations("product");
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  if (!images.length) return <div className="aspect-square rounded-[2rem] bg-sand" />;

  const onScroll = () => {
    const el = stripRef.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div>
      {/* Mobile */}
      <div className="md:hidden">
        <div ref={stripRef} onScroll={onScroll} className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto">
          {images.map((src, i) => (
            <div key={src} className="relative aspect-square w-full shrink-0 snap-center bg-sand">
              <SmartImage src={src} alt={i === 0 ? alt : t("photo", { index: i + 1 })} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
            {images.map((src, i) => (
              <span key={src} className={clsx("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-ink" : "w-1.5 bg-line")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden gap-4 md:flex">
        {images.length > 1 && (
          <div className="flex w-20 shrink-0 flex-col gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={clsx("relative aspect-square overflow-hidden rounded-2xl bg-sand transition", i === active ? "ring-2 ring-ink" : "opacity-80 hover:opacity-100")}
                aria-label={t("photo", { index: i + 1 })}
                aria-pressed={i === active}
              >
                <SmartImage src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="relative aspect-square flex-1 overflow-hidden rounded-[2rem] bg-sand">
          <SmartImage
            key={images[active]}
            src={images[active] ?? images[0]}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="animate-fade-in object-cover"
          />
        </div>
      </div>
    </div>
  );
}
