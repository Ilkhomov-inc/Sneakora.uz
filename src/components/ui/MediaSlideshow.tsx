"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SmartImage } from "./SmartImage";

const FADE_MS = 1200;

/** Photos that cross-fade with a slow zoom (Ken Burns), so a set of stills feels like video. */
export function MediaSlideshow({ images, alt, sizes = "100vw", interval = 4000 }: { images: string[]; alt: string; sizes?: string; interval?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ index, prev }, setSlide] = useState<{ index: number; prev: number | null }>({ index: 0, prev: null });
  const [visible, setVisible] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion !== false || images.length < 2) return;
    const id = setInterval(() => setSlide((s) => ({ index: (s.index + 1) % images.length, prev: s.index })), interval);
    return () => clearInterval(id);
  }, [visible, reducedMotion, images.length, interval]);

  return (
    <div ref={ref} className="absolute inset-0" aria-hidden={images.length > 1 ? undefined : true}>
      {images.map((src, i) => {
        const active = i === index;
        const leaving = i === prev;
        return (
          <SmartImage
            key={src}
            src={src}
            alt={i === 0 ? alt : ""}
            fill
            sizes={sizes}
            className={clsx("object-cover", active || leaving ? "scale-[1.08]" : "scale-100", active ? "opacity-100" : "opacity-0")}
            style={{
              // The outgoing photo keeps its zoom while fading; hidden ones reset instantly.
              transition: active
                ? `opacity ${FADE_MS}ms ease, transform ${interval + FADE_MS}ms linear`
                : leaving
                  ? `opacity ${FADE_MS}ms ease`
                  : "none",
            }}
          />
        );
      })}
    </div>
  );
}
