/**
 * Contract for an online payment provider (Safepay, PayFast, JazzCash, Easypaisa...).
 * To add a provider, write one adapter that implements PaymentGateway and register it
 * in registry.ts. Checkout, callbacks, webhooks and order updates already work with it.
 * See docs/PAYMENT-GATEWAY-GUIDE.md.
 */
export interface GatewayOrder {
  orderNumber: string;
  /** Amount to charge in rupees. */
  amount: number;
  currency: "PKR";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** Where the provider sends the customer's browser after paying. */
  returnUrl: string;
  /** Where the provider sends server-to-server payment notifications. */
  webhookUrl: string;
}

export interface GatewayStart {
  /** The provider's hosted payment page. */
  redirectUrl: string;
  /** The provider's own id for this payment, if any. */
  providerRef?: string;
}

export interface GatewayResult {
  orderNumber: string;
  status: "paid" | "failed" | "pending";
  providerRef?: string;
  /** Amount the provider says was paid (rupees). Compared with the order total. */
  amount?: number;
}

export interface PaymentGateway {
  id: string;
  name: string;
  /** True when every credential the provider needs is present in the environment. */
  isConfigured(): boolean;
  createPayment(order: GatewayOrder): Promise<GatewayStart>;
  /**
   * Reads the provider's browser return or server notification and verifies its
   * signature. Must throw when the signature or data is not valid.
   */
  parseCallback(req: Request): Promise<GatewayResult>;
}
