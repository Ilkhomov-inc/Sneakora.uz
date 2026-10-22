"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { isHlsUrl } from "@/lib/media";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SmartImage } from "./SmartImage";

type Props = {
  type: "IMAGE" | "VIDEO";
  src: string;
  mobileSrc?: string | null;
  poster?: string | null;
  mobilePoster?: string | null;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Pause the video (e.g. when its slide is not visible). */
  paused?: boolean;
};

/** Full-bleed banner background: a photo, an mp4/webm video or an HLS stream. */
export function BannerMedia({ type, src, mobileSrc, poster, mobilePoster, alt, priority, sizes = "100vw", className, paused }: Props) {
  if (type === "VIDEO") {
    return (
      <BannerVideo
        src={src}
        mobileSrc={mobileSrc}
        poster={poster}
        mobilePoster={mobilePoster}
        className={className}
        paused={paused}
      />
    );
  }
  return (
    <>
      <SmartImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={clsx("object-cover", mobileSrc && "hidden md:block", className)}
      />
      {mobileSrc && (
        <SmartImage src={mobileSrc} alt={alt} fill priority={priority} sizes="100vw" className={clsx("object-cover md:hidden", className)} />
      )}
    </>
  );
}

function BannerVideo({
  src,
  mobileSrc,
  poster,
  mobilePoster,
  className,
  paused,
}: Pick<Props, "src" | "mobileSrc" | "poster" | "mobilePoster" | "className" | "paused">) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Only play while on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const activeSrc = isMobile && mobileSrc ? mobileSrc : src;
  const activePoster = (isMobile && mobilePoster) || poster || undefined;

  // Attach the source (HLS needs hls.js everywhere except Safari).
  useEffect(() => {
    const video = ref.current;
    if (!video || isMobile === null) return;
    let destroy: (() => void) | undefined;
    if (isHlsUrl(activeSrc) && !video.canPlayType("application/vnd.apple.mpegurl")) {
      let cancelled = false;
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) return;
        const hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 20 });
        hls.loadSource(activeSrc);
        hls.attachMedia(video);
        destroy = () => hls.destroy();
      });
      return () => {
        cancelled = true;
        destroy?.();
      };
    }
    video.src = activeSrc;
    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [activeSrc, isMobile]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (visible && !paused && !reducedMotion) video.play().catch(() => {});
    else video.pause();
  }, [visible, paused, reducedMotion, activeSrc]);

  return (
    <video
      ref={ref}
      className={clsx("absolute inset-0 h-full w-full object-cover", className)}
      poster={activePoster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}
