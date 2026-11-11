export interface Voucher {
  code: string;
  discount: number;
  type: "percent" | "flat";
  minSpend: number;
  isActive: boolean;
  /** Last valid day (YYYY-MM-DD). Empty means no expiry. */
  expiresAt?: string;
  /** Show this coupon on the home page promo banner. */
  showOnHome?: boolean;
}

export interface PaymentOption {
  id: "cod" | "jazzcash" | "easypaisa" | "sadapay" | "nayapay" | "meezan";
  name: string;
  subtitle: string;
  discountPercent: number;
  isActive: boolean;
  appScheme?: string;
  webFallbackUrl?: string;
  qrCodeUrl?: string;
  /** Online payment provider id (see lib/payments). Empty = manual payment with a transaction ID. */
  gateway?: string;
  accountDetails: {
    title: string;
    accountNumber: string;
    iban?: string;
    raastId?: string;
  };
}

export interface StoreOffersConfig {
  coinsEnabled: boolean;
  coinConversionRate: number;
  paymentMethods: PaymentOption[];
  vouchers: Voucher[];
}

export const initialStoreConfig: StoreOffersConfig = {
  // Disabled: coin balances are not stored per customer yet, so redemption
  // cannot be verified on the server. Re-enable once a coins ledger exists.
  coinsEnabled: false,
  coinConversionRate: 1,
  paymentMethods: [
    {
      id: "cod",
      name: "Cash on Delivery (COD)",
      subtitle: "Pay cash at your doorstep upon arrival",
      discountPercent: 0,
      isActive: true,
      accountDetails: {
        title: "Cash on Delivery",
        accountNumber: "N/A",
      },
    },
    {
      id: "jazzcash",
      name: "JazzCash Mobile Wallet",
      subtitle: "Instant 5% OFF | 1-Click Mobile Pay or Till Scan",
      discountPercent: 5,
      isActive: true,
      appScheme: "jazzcash://",
      webFallbackUrl: "https://www.jazzcash.com.pk/",
      accountDetails: {
        title: "Mewazar",
        accountNumber: "0300-1234567",
        raastId: "03001234567",
      },
    },
    {
      id: "easypaisa",
      name: "EasyPaisa Wallet",
      subtitle: "Instant 5% OFF | Direct EasyPaisa App Transfer",
      discountPercent: 5,
      isActive: true,
      appScheme: "easypaisa://",
      webFallbackUrl: "https://easypaisa.com.pk/",
      accountDetails: {
        title: "Mewazar EasyPaisa",
        accountNumber: "0345-1234567",
        raastId: "03451234567",
      },
    },
    {
      id: "sadapay",
      name: "SadaPay / NayaPay (Fintech)",
      subtitle: "Instant 6% OFF | Pakistan's favorite digital card & wallet",
      discountPercent: 6,
      isActive: true,
      appScheme: "sadapay://",
      webFallbackUrl: "https://sadapay.pk/",
      accountDetails: {
        title: "Mewazar",
        accountNumber: "@mewazar / 0300-1234567",
        iban: "PK12SADA0000001234567890",
      },
    },
    {
      id: "meezan",
      name: "Meezan Islamic Banking / Raast Instant",
      subtitle: "Save 7% Flat Instant via Direct Bank / Raast ID",
      discountPercent: 7,
      isActive: true,
      webFallbackUrl: "https://www.meezanbank.com/",
      accountDetails: {
        title: "Mewazar Pakistan",
        accountNumber: "01020304050607",
        iban: "PK54MEZN0001020304050607",
        raastId: "03001234567",
      },
    },
  ],
  vouchers: [
    {
      code: "MEWA10",
      discount: 10,
      type: "percent",
      minSpend: 1500,
      isActive: true,
      showOnHome: true,
    },
    {
      code: "WELCOME",
      discount: 300,
      type: "flat",
      minSpend: 2000,
      isActive: true,
    },
    {
      code: "ZAR500",
      discount: 500,
      type: "flat",
      minSpend: 4000,
      isActive: true,
    },
  ],
};
