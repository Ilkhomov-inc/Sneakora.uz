import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { isVideoUrl } from "@/lib/media";
import { buttonClass } from "@/lib/ui";
import { SmartImage } from "@/components/ui/SmartImage";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Баннеры" };

const PLACEMENTS = [
  { key: "HERO", title: "Слайдер вверху главной" },
  { key: "PROMO", title: "Промо-блок внизу главной" },
] as const;

export default async function BannersPage() {
  const banners = await db.banner.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }] });

  return (
    <>
      <PageHeader
        title="Баннеры"
        description="Рекламные фото и видео на главной странице. Баннеры брендов настраиваются в разделе «Бренды»."
        actions={
          <Link href="/admin/banners/new" className={buttonClass("primary", "md")}>
            <Plus className="size-4" />
            Добавить баннер
          </Link>
        }
      />
      <div className="space-y-8">
        {PLACEMENTS.map((p) => {
          const list = banners.filter((b) => b.placement === p.key);
          return (
            <section key={p.key}>
              <h2 className="mb-3 font-semibold">{p.title}</h2>
              {list.length === 0 ? (
                <EmptyState>Пока пусто</EmptyState>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((b) => {
                    const preview = b.mediaType === "VIDEO" ? b.posterUrl : b.mediaUrl;
                    return (
                      <Link key={b.id} href={`/admin/banners/${b.id}`} className="overflow-hidden rounded-3xl bg-white transition-shadow hover:shadow-md">
                        <div className="relative aspect-[16/9] bg-ink">
                          {preview && !isVideoUrl(preview) && <SmartImage src={preview} alt="" fill sizes="400px" className="object-cover" />}
                          {b.mediaType === "VIDEO" && (
                            <span className="absolute left-3 top-3 rounded-lg bg-white px-2 py-0.5 text-xs font-bold">Видео</span>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="font-semibold">{b.titleRu || "Без заголовка"}</p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-stone">
                            Порядок {b.sortOrder} {b.isActive ? <Badge tone="green">Показывается</Badge> : <Badge>Скрыт</Badge>}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
