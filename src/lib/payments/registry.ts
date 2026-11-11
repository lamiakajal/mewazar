import type { PaymentGateway } from "@/lib/payments/types";

/**
 * Online payment providers available in this store. It is empty until a provider
 * adapter is written (this needs the provider's merchant account and API docs).
 * Once an adapter exists, import it here and add it to the object below, keyed by its id.
 * Steps: docs/PAYMENT-GATEWAY-GUIDE.md.
 */
const GATEWAYS: Record<string, PaymentGateway> = {};

export const getGateway = (id?: string | null): PaymentGateway | undefined =>
  id ? GATEWAYS[id] : undefined;

/** Providers that are installed and have all their credentials set. */
export const listConfiguredGateways = (): { id: string; name: string }[] =>
  Object.values(GATEWAYS)
    .filter((g) => g.isConfigured())
    .map((g) => ({ id: g.id, name: g.name }));
