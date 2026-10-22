import Image from "next/image";
import clsx from "clsx";
import { SITE } from "@/lib/site";

/** Store logo. Shows the text wordmark until SITE.logoSrc is set. */
export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  if (SITE.logoSrc) {
    return (
      <Image
        src={SITE.logoSrc}
        alt={SITE.name}
        width={160}
        height={32}
        priority
        className={clsx("h-7 w-auto", inverted && "invert", className)}
      />
    );
  }
  return (
    <span className={clsx("inline-flex items-center gap-1.5 font-display text-[1.15rem] font-bold tracking-[0.02em]", className)}>
      <span aria-hidden className="inline-block size-2.5 rotate-45 rounded-[3px] bg-cobalt" />
      {SITE.wordmark}
    </span>
  );
}
