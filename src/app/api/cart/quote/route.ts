import { NextResponse } from "next/server";
import { z } from "zod";
import { cartLineSchema, quoteCart } from "@/lib/orders";

const bodySchema = z.object({ items: z.array(cartLineSchema).max(30) });

/** Current prices and stock for the cart page. */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const lines = await quoteCart(parsed.data.items);
  return NextResponse.json({
    lines: lines.map((l) => ({ key: `${l.variantId}:${l.size}`, price: l.price, stock: l.stock, problem: l.problem })),
  });
}
