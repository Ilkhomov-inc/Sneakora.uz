"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ProductCardData } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { SectionHeading } from "./SectionHeading";

/** Section with a title, a "see all" link and a horizontally scrolling row of product cards. */
export function ProductRail({
  title,
  href,
  linkLabel,
  products,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  products: ProductCardData[];
}) {
  const t = useTranslations("common");
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  if (!products.length) return null;

  return (
    <section>
      <SectionHeading
        title={title}
        action={
          <div className="flex items-center gap-2">
            {href && linkLabel && (
              <Link href={href} className="mr-2 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
                {linkLabel}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            )}
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="hidden size-11 items-center justify-center rounded-2xl bg-sand transition-colors hover:bg-sand-deep md:flex"
              aria-label={t("prev")}
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="hidden size-11 items-center justify-center rounded-2xl bg-sand transition-colors hover:bg-sand-deep md:flex"
              aria-label={t("next")}
            >
              <ArrowRight className="size-5" aria-hidden />
            </button>
          </div>
        }
      />
      <div
        ref={ref}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 md:-mx-8 md:scroll-px-8 md:px-8 xl:-mx-12 xl:scroll-px-12 xl:px-12"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-[31%] xl:w-[23.5%]">
            <ProductCard product={p} sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 68vw" />
          </div>
        ))}
      </div>
    </section>
  );
}
