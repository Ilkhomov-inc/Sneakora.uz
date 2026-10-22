import "server-only";
import { buildOrderMessage } from "../orders";
import { formatPrice } from "../format";

// Notifications about new orders. Off by default; the Telegram bot switches on
// when TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set (see README → «Telegram-бот»).
export type NotifiableOrder = {
  number: number;
  customerName: string;
  phone: string;
  comment: string | null;
  total: number;
  items: { brandName: string; name: string; colorName: string; size: string; quantity: number; price: number }[];
};

export interface OrderNotifier {
  notifyNewOrder(order: NotifiableOrder): Promise<void>;
}

class TelegramBotNotifier implements OrderNotifier {
  constructor(
    private token: string,
    private chatId: string,
  ) {}

  async notifyNewOrder(order: NotifiableOrder) {
    const site = process.env.SITE_URL ?? "";
    const text = [
      `🆕 Новый заказ №${order.number} — ${formatPrice(order.total, "ru")}`,
      "",
      buildOrderMessage(order, "ru", "сайте").split("\n").slice(2).join("\n"),
      ...(site ? ["", `${site}/admin/orders`] : []),
    ].join("\n");
    const res = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: this.chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) console.error("Telegram notification failed", res.status, await res.text());
  }
}

class NoopNotifier implements OrderNotifier {
  async notifyNewOrder() {}
}

export function getOrderNotifier(): OrderNotifier {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = process.env;
  return token && chatId ? new TelegramBotNotifier(token, chatId) : new NoopNotifier();
}
