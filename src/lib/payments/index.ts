import "server-only";

// Payment methods. Today every order is "manual": the manager agrees on payment in Telegram.
// Online payment (Click, Payme, Uzum…) = a new PaymentProvider + a callback route that updates
// Order.paymentStatus. Order already stores paymentMethod and paymentStatus.
export type PaymentMethod = "manual";

export type PaymentStart = {
  /** Where to send the customer to pay; absent for manual payment. */
  redirectUrl?: string;
};

export interface PaymentProvider {
  id: PaymentMethod;
  start(order: { id: string; number: number; total: number }): Promise<PaymentStart>;
}

const manual: PaymentProvider = {
  id: "manual",
  async start() {
    return {};
  },
};

const providers: Record<PaymentMethod, PaymentProvider> = { manual };

export function getPaymentProvider(method: PaymentMethod = "manual"): PaymentProvider {
  return providers[method];
}
