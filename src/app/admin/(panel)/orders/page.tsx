import Link from "next/link";
import clsx from "clsx";
import { Search } from "lucide-react";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_TONE, sum } from "@/lib/admin-format";
import { buttonClass } from "@/lib/ui";
import { Badge, EmptyState, inputClass, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Заказы" };

const PER_PAGE = 50;
const STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const qNumber = Number(q.replace(/\D/g, ""));
  const qDigits = q.replace(/\D/g, "");

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            ...(qNumber && qNumber < 2_147_483_647 ? [{ number: qNumber }] : []),
            { customerName: { contains: q, mode: "insensitive" as const } },
            ...(qDigits.length >= 4 ? [{ phone: { contains: qDigits.slice(-7) } }] : []),
          ],
        }
      : {}),
  };

  const [orders, total, counts] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countFor = (s: OrderStatus) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const all = counts.reduce((a, c) => a + c._count._all, 0);
  const pages = Math.ceil(total / PER_PAGE);

  const tabHref = (s?: OrderStatus) => `/admin/orders${s ? `?status=${s}` : ""}`;

  return (
    <>
      <PageHeader title="Заказы" description="Заказы с сайта. Клиент после оформления пишет вам в Telegram с номером заказа." />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={tabHref()} className={clsx("rounded-xl px-3 py-2 text-sm font-semibold", !status ? "bg-ink text-white" : "bg-white hover:bg-sand")}>
          Все · {all}
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={tabHref(s)} className={clsx("rounded-xl px-3 py-2 text-sm font-semibold", status === s ? "bg-ink text-white" : "bg-white hover:bg-sand")}>
            {ORDER_STATUS_LABEL[s]} · {countFor(s)}
          </Link>
        ))}
      </div>

      <form className="mb-5 flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Номер заказа, имя или телефон" className={`${inputClass} pl-9`} />
        </div>
        <button type="submit" className={buttonClass("outline", "md")}>
          Найти
        </button>
      </form>

      {orders.length === 0 ? (
        <EmptyState>Заказов не найдено.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line text-left text-stone">
                <tr>
                  <th className="px-4 py-3 font-medium">№</th>
                  <th className="px-4 py-3 font-medium">Клиент</th>
                  <th className="px-4 py-3 font-medium">Товаров</th>
                  <th className="px-4 py-3 font-medium">Сумма</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Создан</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-sand/40">
                    <td className="px-4 py-3 font-semibold">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:underline">
                        {o.customerName}
                      </Link>
                      <span className="block text-stone">{o.phone}</span>
                    </td>
                    <td className="px-4 py-3">{o.itemsCount}</td>
                    <td className="px-4 py-3 font-semibold">{sum(o.total)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-stone">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
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
              href={`/admin/orders?${new URLSearchParams({ ...(status && { status }), ...(q && { q }), page: String(n) })}`}
              className={clsx("flex size-10 items-center justify-center rounded-xl text-sm font-semibold", n === page ? "bg-ink text-white" : "bg-white hover:bg-sand")}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
