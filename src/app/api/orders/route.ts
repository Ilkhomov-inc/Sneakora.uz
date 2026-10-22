import { after, NextResponse } from "next/server";
import { createOrder, orderInputSchema, OrderValidationError } from "@/lib/orders";
import { getOrderNotifier } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Places an order from the cart. The customer then continues in Telegram (see /order/[token]). */
export async function POST(request: Request) {
  const parsed = orderInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    return NextResponse.json({ error: "invalid", fields }, { status: 400 });
  }
  // Honeypot filled in: pretend success without creating anything.
  if (parsed.data.website) return NextResponse.json({ error: "invalid", fields: [] }, { status: 400 });

  if (!rateLimit(`order:${await clientIp()}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const order = await createOrder(parsed.data);
    after(() => getOrderNotifier().notifyNewOrder(order).catch((e) => console.error("Order notification failed", e)));
    return NextResponse.json({ token: order.publicToken, number: order.number }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json(
        {
          error: "stock",
          lines: error.lines.map((l) => ({ key: `${l.variantId}:${l.size}`, price: l.price, stock: l.stock, problem: l.problem })),
        },
        { status: 409 },
      );
    }
    throw error;
  }
}
