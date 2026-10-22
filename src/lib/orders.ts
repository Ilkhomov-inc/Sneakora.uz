import "server-only";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import { formatPrice, tr } from "./format";
import type { Locale } from "./types";

export const cartLineSchema = z.object({
  variantId: z.string().min(1).max(40),
  size: z.string().min(1).max(6),
  quantity: z.number().int().min(1).max(10),
});

export const orderInputSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .max(25)
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 9 && digits.length <= 15;
    }),
  comment: z.string().trim().max(500).optional().default(""),
  locale: z.enum(["ru", "uz"]).default("ru"),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional(),
  items: z.array(cartLineSchema).min(1).max(30),
});

export type CartLineInput = z.infer<typeof cartLineSchema>;
export type OrderInput = z.infer<typeof orderInputSchema>;

export type LineProblem = "unavailable" | "out_of_stock" | "not_enough";

export type QuotedLine = CartLineInput & {
  productId: string | null;
  slug: string | null;
  sku: string;
  name: string;
  brandName: string;
  colorNameRu: string;
  colorNameUz: string;
  image: string | null;
  price: number;
  stock: number;
  problem: LineProblem | null;
};

/** Current prices and stock for cart lines. The cart in the browser is never trusted. */
export async function quoteCart(lines: CartLineInput[]): Promise<QuotedLine[]> {
  const variants = await db.productVariant.findMany({
    where: { id: { in: [...new Set(lines.map((l) => l.variantId))] } },
    include: {
      sizes: true,
      product: { include: { brand: { select: { name: true, isActive: true } } } },
    },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  return lines.map((line) => {
    const variant = byId.get(line.variantId);
    if (!variant || !variant.product.isPublished || !variant.product.brand.isActive) {
      return {
        ...line,
        productId: variant?.productId ?? null,
        slug: variant?.product.slug ?? null,
        sku: variant?.sku ?? "",
        name: variant?.product.name ?? "",
        brandName: variant?.product.brand.name ?? "",
        colorNameRu: variant?.colorNameRu ?? "",
        colorNameUz: variant?.colorNameUz ?? "",
        image: variant?.images[0] ?? null,
        price: 0,
        stock: 0,
        problem: "unavailable" as const,
      };
    }
    const stock = variant.sizes.find((s) => s.size === line.size)?.stock ?? 0;
    const problem: LineProblem | null = stock <= 0 ? "out_of_stock" : stock < line.quantity ? "not_enough" : null;
    return {
      ...line,
      productId: variant.productId,
      slug: variant.product.slug,
      sku: variant.sku,
      name: variant.product.name,
      brandName: variant.product.brand.name,
      colorNameRu: variant.colorNameRu,
      colorNameUz: variant.colorNameUz,
      image: variant.images[0] ?? null,
      price: variant.product.salePrice ?? variant.product.price,
      stock,
      problem,
    };
  });
}

export class OrderValidationError extends Error {
  constructor(public lines: QuotedLine[]) {
    super("Some cart lines are not available");
  }
}

export async function createOrder(input: OrderInput) {
  // Merge duplicate lines (same colourway and size).
  const merged = new Map<string, CartLineInput>();
  for (const line of input.items) {
    const key = `${line.variantId}:${line.size}`;
    const prev = merged.get(key);
    merged.set(key, { ...line, quantity: Math.min(10, (prev?.quantity ?? 0) + line.quantity) });
  }
  const lines = await quoteCart([...merged.values()]);
  if (lines.some((l) => l.problem)) throw new OrderValidationError(lines);

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const itemsCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return db.order.create({
    data: {
      publicToken: randomBytes(16).toString("hex"),
      customerName: input.customerName,
      phone: input.phone,
      comment: input.comment || null,
      locale: input.locale,
      itemsCount,
      total,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          sku: l.sku,
          name: l.name,
          brandName: l.brandName,
          colorName: tr(input.locale, l.colorNameRu, l.colorNameUz),
          size: l.size,
          image: l.image,
          price: l.price,
          quantity: l.quantity,
        })),
      },
    },
    include: { items: true },
  });
}

type OrderForMessage = {
  number: number;
  customerName: string;
  phone: string;
  comment: string | null;
  total: number;
  items: { brandName: string; name: string; colorName: string; size: string; quantity: number; price: number }[];
};

/** Text the customer sends us in Telegram (also used by the bot notifier). */
export function buildOrderMessage(order: OrderForMessage, locale: Locale, siteName: string): string {
  const ru = locale === "ru";
  const lines = order.items.map(
    (item, i) =>
      `${i + 1}. ${item.brandName} ${item.name} — ${item.colorName}, EU ${item.size} × ${item.quantity} — ${formatPrice(item.price * item.quantity, locale)}`,
  );
  return [
    ru ? `Здравствуйте! Хочу оформить заказ №${order.number} на ${siteName}` : `Assalomu alaykum! ${siteName} saytida №${order.number} buyurtmani rasmiylashtirmoqchiman`,
    "",
    ...lines,
    "",
    `${ru ? "Итого" : "Jami"}: ${formatPrice(order.total, locale)}`,
    `${ru ? "Имя" : "Ism"}: ${order.customerName}`,
    `${ru ? "Телефон" : "Telefon"}: ${order.phone}`,
    ...(order.comment ? [`${ru ? "Комментарий" : "Izoh"}: ${order.comment}`] : []),
  ].join("\n");
}

export async function getOrderByToken(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  return db.order.findUnique({ where: { publicToken: token }, include: { items: true } });
}
