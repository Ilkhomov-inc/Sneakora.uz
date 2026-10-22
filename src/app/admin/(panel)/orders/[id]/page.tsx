import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_TONE, sum } from "@/lib/admin-format";
import { phoneDigits } from "@/lib/format";
import { buttonClass } from "@/lib/ui";
import { SmartImage } from "@/components/ui/SmartImage";
import { TelegramIcon } from "@/components/shop/TelegramIcon";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export const metadata = { title: "Заказ" };

export default async function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const digits = phoneDigits(order.phone);

  return (
    <>
      <PageHeader
        title={`Заказ №${order.number}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {formatDate(order.createdAt)} · {order.locale === "uz" ? "узбекская версия сайта" : "русская версия сайта"}
            <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
          </span>
        }
        back={{ href: "/admin/orders", label: "Заказы" }}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card title={`Товары · ${order.itemsCount} шт.`}>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {item.image && <SmartImage src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">
                    {item.productId ? (
                      <Link href={`/admin/products/${item.productId}`} className="hover:underline">
                        {item.brandName} {item.name}
                      </Link>
                    ) : (
                      `${item.brandName} ${item.name}`
                    )}
                  </p>
                  <p className="text-stone">
                    {item.colorName} · EU {item.size} · арт. {item.sku}
                  </p>
                </div>
                <p className="shrink-0 text-right text-sm">
                  <span className="font-semibold">{sum(item.price * item.quantity)}</span>
                  <span className="block text-stone">
                    {item.quantity} × {sum(item.price)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-bold">
            <span>Итого</span>
            <span>{sum(order.total)}</span>
          </p>
          <p className="mt-2 text-xs text-stone">Остатки не списываются автоматически — после подтверждения обновите их в карточке товара.</p>
        </Card>

        <div className="space-y-6">
          <Card title="Клиент">
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-stone">{order.phone}</p>
            {order.comment && <p className="mt-3 rounded-2xl bg-sand p-3 text-sm">{order.comment}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:+${digits}`} className={buttonClass("outline", "sm")}>
                <Phone className="size-4" />
                Позвонить
              </a>
              <a href={`https://t.me/+${digits}`} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "sm")}>
                <TelegramIcon className="size-4 text-cobalt" />
                Telegram
              </a>
            </div>
          </Card>
          <Card title="Обработка">
            <OrderStatusForm id={order.id} status={order.status} adminNote={order.adminNote} />
          </Card>
        </div>
      </div>
    </>
  );
}
