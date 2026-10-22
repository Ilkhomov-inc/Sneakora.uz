"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { ArrowRight, Pause, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BannerMedia } from "@/components/ui/BannerMedia";
import { buttonClass } from "@/lib/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type HeroSlide = {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  mediaUrlMobile: string | null;
  posterUrl: string | null;
  posterUrlMobile: string | null;
  eyebrow: string;
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string | null;
};

const DURATION = 7000;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const autoplay = slides.length > 1 && !hovered && !stopped && reducedMotion === false;

  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!autoplay) return;
    const id = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(id);
  }, [autoplay, index, go]);

  if (!slides.length) return null;

  return (
    <section
      className="shell pt-4"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-[min(78svh,720px)] min-h-[480px] overflow-hidden rounded-[2rem] bg-ink text-white">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              className={clsx("absolute inset-0 transition-opacity duration-700", active ? "opacity-100" : "pointer-events-none opacity-0")}
              aria-hidden={!active}
              role="group"
              aria-roledescription="slide"
              aria-label={t("home.slide", { index: i + 1 })}
            >
              <BannerMedia
                type={slide.mediaType}
                src={slide.mediaUrl}
                mobileSrc={slide.mediaUrlMobile}
                poster={slide.posterUrl}
                mobilePoster={slide.posterUrlMobile}
                alt={slide.title}
                priority={i === 0}
                paused={!active}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/0" />
              <div className="absolute inset-x-0 bottom-0 p-6 pb-20 md:p-12 md:pb-14">
                <div className={clsx("max-w-2xl", active && "animate-slide-up")}>
                  {slide.eyebrow && (
                    <p className="mb-4 inline-flex rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] backdrop-blur">
                      {slide.eyebrow}
                    </p>
                  )}
                  <h2 className="font-display text-[2rem] font-bold leading-[1.05] tracking-tight md:text-6xl">{slide.title}</h2>
                  {slide.text && <p className="mt-4 max-w-lg text-base text-white/85 md:text-lg">{slide.text}</p>}
                  {slide.ctaHref && slide.ctaLabel && (
                    <Link href={slide.ctaHref} className={buttonClass("light", "lg", "mt-7")} tabIndex={active ? 0 : -1}>
                      {slide.ctaLabel}
                      <ArrowRight className="size-5" aria-hidden />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {slides.length > 1 && (
          <div className="absolute inset-x-6 bottom-6 flex items-center gap-3 md:inset-x-auto md:right-12 md:bottom-14">
            <div className="flex flex-1 gap-2 md:w-56 md:flex-none">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(i)}
                  className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/30"
                  aria-label={t("home.slide", { index: i + 1 })}
                  aria-current={i === index}
                >
                  {i < index && <span className="absolute inset-0 bg-white" />}
                  {i === index && (
                    <span
                      key={`${index}-${autoplay}`}
                      className={clsx("absolute inset-0 origin-left bg-white", autoplay && "animate-progress")}
                      style={autoplay ? { animationDuration: `${DURATION}ms` } : undefined}
                    />
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStopped((s) => !s)}
              className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur transition hover:bg-white/25"
              aria-label={stopped ? "Play" : "Pause"}
            >
              {stopped ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
