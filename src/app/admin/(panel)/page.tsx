import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_TONE, sum } from "@/lib/admin-format";
import { Badge, Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Дашборд" };

export default async function DashboardPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [newOrders, todayOrders, published, brands, recent, settings] = await Promise.all([
    db.order.count({ where: { status: "NEW" } }),
    db.order.count({ where: { createdAt: { gte: startOfDay } } }),
    db.product.count({ where: { isPublished: true } }),
    db.brand.count({ where: { isActive: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    getSettings(),
  ]);

  const stats = [
    { label: "Новые заказы", value: newOrders, href: "/admin/orders?status=NEW" },
    { label: "Заказов сегодня", value: todayOrders, href: "/admin/orders" },
    { label: "Товаров на сайте", value: published, href: "/admin/products" },
    { label: "Брендов", value: brands, href: "/admin/brands" },
  ];

  return (
    <>
      <PageHeader title="Дашборд" description="Сводка по магазину" />

      {!settings.telegramUsername && (
        <Link href="/admin/settings" className="mb-6 flex items-center gap-3 rounded-3xl bg-[#FFF4E5] p-5 text-sm font-semibold text-[#9A3412]">
          <AlertTriangle className="size-5 shrink-0" aria-hidden />
          Укажите Telegram для заказов в настройках — без него покупатели не смогут отправить вам заказ в Telegram.
          <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-3xl bg-white p-5 transition-shadow hover:shadow-md">
            <p className="text-sm text-stone">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{s.value}</p>
          </Link>
        ))}
      </div>

      <Card title="Последние заказы" className="mt-6">
        {recent.length === 0 ? (
          <p className="text-sm text-stone">Заказов пока нет.</p>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-stone">
                <tr>
                  <th className="px-2 py-2 font-medium">№</th>
                  <th className="px-2 py-2 font-medium">Клиент</th>
                  <th className="px-2 py-2 font-medium">Сумма</th>
                  <th className="px-2 py-2 font-medium">Статус</th>
                  <th className="px-2 py-2 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((o) => (
                  <tr key={o.id} className="hover:bg-sand/50">
                    <td className="px-2 py-3 font-semibold">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.number}
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      {o.customerName}
                      <span className="block text-stone">{o.phone}</span>
                    </td>
                    <td className="px-2 py-3 font-semibold">{sum(o.total)}</td>
                    <td className="px-2 py-3">
                      <Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                    </td>
                    <td className="px-2 py-3 text-stone">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
