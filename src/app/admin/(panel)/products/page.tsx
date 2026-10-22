import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { GENDER_LABEL, sum } from "@/lib/admin-format";
import { buttonClass } from "@/lib/ui";
import { SmartImage } from "@/components/ui/SmartImage";
import { Badge, EmptyState, inputClass, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Товары" };

const PER_PAGE = 50;

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const brand = typeof sp.brand === "string" ? sp.brand : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(brand ? { brandId: brand } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const [products, total, brands] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        brand: { select: { name: true } },
        variants: { orderBy: { sortOrder: "asc" }, select: { images: true, sizes: { select: { stock: true } } } },
      },
    }),
    db.product.count({ where }),
    db.brand.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  const pages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <PageHeader
        title="Товары"
        description={`Всего: ${total}`}
        actions={
          <Link href="/admin/products/new" className={buttonClass("primary", "md")}>
            <Plus className="size-4" />
            Добавить товар
          </Link>
        }
      />

      <form className="mb-5 flex flex-wrap gap-2">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Название или артикул" className={`${inputClass} pl-9`} />
        </div>
        <select name="brand" defaultValue={brand} className={`${inputClass} w-auto`}>
          <option value="">Все бренды</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClass("outline", "md")}>
          Найти
        </button>
      </form>

      {products.length === 0 ? (
        <EmptyState>Товары не найдены.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-line text-left text-stone">
                <tr>
                  <th className="px-4 py-3 font-medium">Товар</th>
                  <th className="px-4 py-3 font-medium">Для кого</th>
                  <th className="px-4 py-3 font-medium">Цена</th>
                  <th className="px-4 py-3 font-medium">В наличии</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => {
                  const stock = p.variants.reduce((s, v) => s + v.sizes.reduce((a, b) => a + b.stock, 0), 0);
                  const image = p.variants[0]?.images[0];
                  return (
                    <tr key={p.id} className="hover:bg-sand/40">
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                          <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                            {image && <SmartImage src={image} alt="" fill sizes="48px" className="object-cover" />}
                          </span>
                          <span>
                            <span className="block text-xs font-semibold uppercase tracking-wide text-stone">{p.brand.name}</span>
                            <span className="font-semibold hover:underline">{p.name}</span>
                            <span className="block text-xs text-stone">Расцветок: {p.variants.length}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">{GENDER_LABEL[p.gender]}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{sum(p.finalPrice)}</span>
                        {p.salePrice && <span className="block text-xs text-stone line-through">{sum(p.price)}</span>}
                      </td>
                      <td className="px-4 py-3">{stock > 0 ? `${stock} пар` : <Badge tone="red">Нет</Badge>}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.isPublished ? <Badge tone="green">На сайте</Badge> : <Badge>Скрыт</Badge>}
                          {p.isNew && <Badge tone="blue">Новинка</Badge>}
                          {p.salePrice && <Badge tone="orange">Скидка</Badge>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/products?${new URLSearchParams({ ...(q && { q }), ...(brand && { brand }), page: String(n) })}`}
              className={`flex size-10 items-center justify-center rounded-xl text-sm font-semibold ${n === page ? "bg-ink text-white" : "bg-white hover:bg-sand"}`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
