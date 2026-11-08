import type { PaymentOption, Voucher } from "@/data/storeConfig";
import type { CategoryMeta } from "@/data/categories";

export interface CourierOption {
  name: string;
  /** Tracking page link; use {id} where the tracking number goes. Optional. */
  trackingUrl: string;
}

/** Everything the shop owner can change from /admin/settings (no coding needed). */
export interface StoreSettings {
  contact: {
    whatsapp: string; // digits with country code, e.g. 923001234567
    phone: string;
    supportEmail: string;
    salesEmail: string;
    address: string;
  };
  shipping: {
    fee: number;
    freeThreshold: number;
    deliveryDays: string; // e.g. "2 to 5 working days"
    returnDays: number;
  };
  announcement: { enabled: boolean; text: string; link: string };
  sale: { enabled: boolean; headline: string; subtext: string };
  payments: PaymentOption[];
  vouchers: Voucher[];
  couriers: CourierOption[];
  rewards: RewardSettings;
  orders: { acceptingOrders: boolean; closedMessage: string; minOrderAmount: number };
  inventory: { lowStockThreshold: number };
  social: { facebook: string; instagram: string; tiktok: string; youtube: string };
  categories: CategoryMeta[];
  brand: { name: string; tagline: string; logoUrl: string };
  home: HomeContent;
  faq: { q: string; a: string }[];
  /** Page text written by the owner. Empty string means "use the built-in text". */
  pages: Record<PageKey, string>;
}

export type PageKey = "about" | "delivery" | "returns" | "privacy" | "terms";

export interface HomeContent {
  heroTitle: string;
  /** A word inside heroTitle that gets the moving colour effect. */
  heroHighlight: string;
  heroSubtitle: string;
  primaryButton: string;
  secondaryButton: string;
  /** Show built-in sample testimonials until enough real reviews exist. Turn off before launch. */
  showSampleReviews: boolean;
  rotatingWords: string[];
  marqueeWords: string[];
  marqueeNotes: string[];
}

export interface RewardSettings {
  enabled: boolean;
  /** Coins earned per Rs. 100 spent (on delivered orders). */
  earnPercent: number;
  /** Value of one coin in rupees. */
  coinValue: number;
  /** Maximum share of an order that coins can pay for. */
  maxRedeemPercent: number;
}

/** The part of the settings that is safe to ship to every visitor's browser. */
export interface PublicSettings {
  contact: StoreSettings["contact"];
  shipping: StoreSettings["shipping"];
  announcement: StoreSettings["announcement"];
  rewards: RewardSettings;
  orders: StoreSettings["orders"];
  inventory: StoreSettings["inventory"];
  social: StoreSettings["social"];
  categories: CategoryMeta[];
  brand: StoreSettings["brand"];
  saleCount: number;
}
