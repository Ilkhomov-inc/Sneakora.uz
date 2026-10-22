import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { buttonClass } from "@/lib/ui";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Бренды" };

export default async function BrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <PageHeader
        title="Бренды"
        description="Главные разделы сайта. Каждый активный бренд появляется в меню с подразделами Мужчинам / Женщинам / Детям."
        actions={
          <Link href="/admin/brands/new" className={buttonClass("primary", "md")}>
            <Plus className="size-4" />
            Добавить бренд
          </Link>
        }
      />
      {brands.length === 0 ? (
        <EmptyState>Брендов пока нет.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <Link key={b.id} href={`/admin/brands/${b.id}`} className="flex items-center gap-4 rounded-3xl bg-white p-5 transition-shadow hover:shadow-md">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-sand p-3">
                {b.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- brand logos are small SVG/PNG files
                  <img src={b.logoUrl} alt="" className="max-h-full max-w-full" />
                ) : (
                  <span className="font-display text-xl font-bold">{b.name[0]}</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-lg font-semibold">{b.name}</span>
                <span className="block text-sm text-stone">
                  Товаров: {b._count.products} · порядок {b.sortOrder}
                </span>
                <span className="mt-1.5 block">{b.isActive ? <Badge tone="green">На сайте</Badge> : <Badge>Скрыт</Badge>}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
