import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BannerMedia } from "@/components/ui/BannerMedia";
import { buttonClass } from "@/lib/ui";

export type PromoBannerData = {
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

export function PromoBanners({ banners }: { banners: PromoBannerData[] }) {
  if (!banners.length) return null;
  return (
    <section className="shell space-y-4">
      {banners.map((b) => (
        <div key={b.id} className="relative flex min-h-[420px] items-end overflow-hidden rounded-[2rem] bg-ink text-white md:min-h-[460px] md:items-center">
          <BannerMedia
            type={b.mediaType}
            src={b.mediaUrl}
            mobileSrc={b.mediaUrlMobile}
            poster={b.posterUrl}
            mobilePoster={b.posterUrlMobile}
            alt={b.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/0 md:bg-gradient-to-r md:from-black/70 md:via-black/30" />
          <div className="relative max-w-xl p-6 md:p-14">
            {b.eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-flame">{b.eyebrow}</p>}
            <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">{b.title}</h2>
            {b.text && <p className="mt-3 text-white/85 md:text-lg">{b.text}</p>}
            {b.ctaHref && b.ctaLabel && (
              <Link href={b.ctaHref} className={buttonClass("light", "lg", "mt-6")}>
                {b.ctaLabel}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
