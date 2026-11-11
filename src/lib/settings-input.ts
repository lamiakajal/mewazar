import { defaultSettings } from "@/lib/settings-defaults";
import type { StoreSettings } from "@/lib/settings-types";

/** Sections edited on the Settings page (content, categories and brand have their own pages). */
export type SettingsSections = Omit<StoreSettings, "categories" | "brand" | "home" | "faq" | "pages">;

type Result = { ok: true; data: SettingsSections } | { ok: false; error: string };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

/** Validates the settings form so wrong values can never reach checkout or the storefront. */
export function sanitizeSettings(body: unknown): Result {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid data" };
  const b = body as Record<string, Record<string, unknown> & unknown[]>;
  const d = defaultSettings();

  const whatsapp = str(b.contact?.whatsapp, 20).replace(/\D/g, "");
  if (whatsapp.length < 10 || whatsapp.length > 15) {
    return { ok: false, error: "WhatsApp number must include the country code, e.g. 923001234567" };
  }
  const supportEmail = str(b.contact?.supportEmail, 120);
  const salesEmail = str(b.contact?.salesEmail, 120) || supportEmail;
  if (!isEmail(supportEmail) || !isEmail(salesEmail)) {
    return { ok: false, error: "Please enter valid email addresses" };
  }

  const link = str(b.announcement?.link, 200);
  if (link && !/^(\/|https:\/\/)/.test(link)) {
    return { ok: false, error: "The announcement link must start with / or https://" };
  }

  // Payment methods: keep the fixed list of supported ids, edit their details
  const incoming = Array.isArray(b.payments) ? (b.payments as unknown as Record<string, unknown>[]) : [];
  const payments = d.payments.map((def) => {
    const p = (incoming.find((x) => x?.id === def.id) ?? def) as Record<string, unknown>;
    const a = (p.accountDetails ?? def.accountDetails) as Record<string, unknown>;
    return {
      ...def,
      name: str(p.name, 70) || def.name,
      subtitle: str(p.subtitle, 140),
      discountPercent: int(p.discountPercent, 0, 50, 0),
      isActive: !!p.isActive,
      gateway: str(p.gateway, 30) || undefined,
      accountDetails: {
        title: str(a.title, 70),
        accountNumber: str(a.accountNumber, 60),
        iban: str(a.iban, 40) || undefined,
        raastId: str(a.raastId, 40) || undefined,
      },
    };
  });
  if (!payments.some((p) => p.isActive)) {
    return { ok: false, error: "Keep at least one payment method switched on" };
  }

  // Coupons
  const rawVouchers = Array.isArray(b.vouchers) ? (b.vouchers as unknown as Record<string, unknown>[]) : [];
  if (rawVouchers.length > 30) return { ok: false, error: "Too many coupons (30 maximum)" };
  const seen = new Set<string>();
  const vouchers = [];
  for (const v of rawVouchers) {
    const code = str(v.code, 20).toUpperCase();
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
      return { ok: false, error: `Coupon code "${code}" must be 3 to 20 letters or numbers` };
    }
    if (seen.has(code)) return { ok: false, error: `Coupon code ${code} is used twice` };
    seen.add(code);

    const type = v.type === "flat" ? "flat" : "percent";
    const discount = int(v.discount, 1, type === "percent" ? 100 : 1_000_000, 0);
    if (discount < 1) return { ok: false, error: `Coupon ${code} needs a discount amount` };
    const expiresAt = str(v.expiresAt, 10);
    if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
      return { ok: false, error: `Coupon ${code} has an invalid expiry date` };
    }
    vouchers.push({
      code,
      type: type as "percent" | "flat",
      discount,
      minSpend: int(v.minSpend, 0, 10_000_000, 0),
      isActive: !!v.isActive,
      expiresAt: expiresAt || undefined,
      showOnHome: !!v.showOnHome,
    });
  }

  // Couriers
  const rawCouriers = Array.isArray(b.couriers) ? (b.couriers as unknown as Record<string, unknown>[]) : [];
  const couriers = [];
  for (const c of rawCouriers.slice(0, 20)) {
    const name = str(c.name, 30);
    if (!name) continue;
    const trackingUrl = str(c.trackingUrl, 300);
    if (trackingUrl && !trackingUrl.startsWith("https://")) {
      return { ok: false, error: `${name}: the tracking link must start with https://` };
    }
    couriers.push({ name, trackingUrl });
  }

  // Social links must be https:// addresses (or empty)
  const social: Record<string, string> = {};
  for (const key of ["facebook", "instagram", "tiktok", "youtube"]) {
    const url = str(b.social?.[key], 200);
    if (url && !url.startsWith("https://")) {
      return { ok: false, error: `The ${key} link must start with https://` };
    }
    social[key] = url;
  }

  return {
    ok: true,
    data: {
      contact: {
        whatsapp,
        phone: str(b.contact?.phone, 30),
        supportEmail,
        salesEmail,
        address: str(b.contact?.address, 200),
      },
      shipping: {
        fee: int(b.shipping?.fee, 0, 100000, d.shipping.fee),
        freeThreshold: int(b.shipping?.freeThreshold, 0, 10_000_000, d.shipping.freeThreshold),
        deliveryDays: str(b.shipping?.deliveryDays, 60) || d.shipping.deliveryDays,
        returnDays: int(b.shipping?.returnDays, 0, 90, d.shipping.returnDays),
      },
      announcement: {
        enabled: !!b.announcement?.enabled,
        text: str(b.announcement?.text, 140),
        link,
      },
      sale: {
        enabled: !!b.sale?.enabled,
        headline: str(b.sale?.headline, 100) || d.sale.headline,
        subtext: str(b.sale?.subtext, 240),
      },
      payments,
      vouchers,
      couriers,
      rewards: {
        enabled: !!b.rewards?.enabled,
        earnPercent: int(b.rewards?.earnPercent, 0, 50, d.rewards.earnPercent),
        coinValue: int(b.rewards?.coinValue, 1, 1000, d.rewards.coinValue),
        maxRedeemPercent: int(b.rewards?.maxRedeemPercent, 0, 100, d.rewards.maxRedeemPercent),
      },
      orders: {
        acceptingOrders: b.orders?.acceptingOrders !== false,
        closedMessage: str(b.orders?.closedMessage, 200) || d.orders.closedMessage,
        minOrderAmount: int(b.orders?.minOrderAmount, 0, 1_000_000, 0),
      },
      inventory: { lowStockThreshold: int(b.inventory?.lowStockThreshold, 0, 1000, 5) },
      social: social as StoreSettings["social"],
    },
  };
}
