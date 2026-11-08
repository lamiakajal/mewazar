import { BRAND } from "@/data/brand";
import { initialStoreConfig } from "@/data/storeConfig";
import type { StoreSettings } from "@/lib/settings-types";
import { CATEGORIES } from "@/data/categories";

/** Starting values; the admin panel overrides them (stored in MongoDB). */
export function defaultSettings(): StoreSettings {
  return {
    contact: {
      whatsapp: BRAND.whatsappNumber,
      phone: BRAND.phoneDisplay,
      supportEmail: BRAND.supportEmail,
      salesEmail: BRAND.salesEmail,
      address: "",
    },
    shipping: {
      fee: BRAND.flatShippingFee,
      freeThreshold: BRAND.freeShippingThreshold,
      deliveryDays: "2 to 5 working days",
      returnDays: 7,
    },
    announcement: { enabled: false, text: "", link: "" },
    sale: {
      enabled: true,
      headline: "Gift boxes that look as good as they taste",
      subtext:
        "Hand-packed hampers of nuts, dates, saffron and honey for weddings, Eid and office gifting.",
    },
    payments: structuredClone(initialStoreConfig.paymentMethods),
    vouchers: structuredClone(initialStoreConfig.vouchers),
    couriers: [
      { name: "TCS", trackingUrl: "" },
      { name: "Leopards", trackingUrl: "" },
      { name: "M&P", trackingUrl: "" },
      { name: "PostEx", trackingUrl: "" },
      { name: "Trax", trackingUrl: "" },
    ],
    // 2% of the order value comes back as coins once the order is delivered; 1 coin = Rs. 1
    rewards: { enabled: true, earnPercent: 2, coinValue: 1, maxRedeemPercent: 20 },
    orders: { acceptingOrders: true, closedMessage: "We are not taking new orders right now. Please check back soon.", minOrderAmount: 0 },
    inventory: { lowStockThreshold: 5 },
    social: { facebook: "", instagram: "", tiktok: "", youtube: "" },
    categories: structuredClone(CATEGORIES),
    brand: { name: BRAND.name, tagline: BRAND.tagline, logoUrl: "" },
    home: {
      heroTitle: "Honey, nuts and dry fruits from the mountains to your table",
      heroHighlight: "mountains",
      heroSubtitle:
        "Raw Sidr honey, Gilgit walnuts, Ajwa dates, saffron and more, sorted by hand, packed in small batches and delivered with Cash on Delivery.",
      primaryButton: "Shop the harvest",
      secondaryButton: "Browse gift boxes",
      showSampleReviews: true,
      rotatingWords: ["Raw Sidr honey", "Gilgit walnuts", "Ajwa dates", "Kashmiri saffron", "Desi cow ghee"],
      marqueeWords: ["Raw Sidr Honey", "Gilgit Walnuts", "California Almonds", "Ajwa Dates", "Kashmiri Saffron", "Desi Cow Ghee", "Hunza Green Tea", "Mountain Figs"],
      marqueeNotes: ["Cash on Delivery", "7-day freshness promise", "Hand-packed in small batches", "No added sugar or preservatives", "Nationwide shipping"],
    },
    faq: [
      { q: "Is your honey really raw?", a: "Yes. Our honey is not heated or blended with sugar syrup. Natural crystallisation over time is normal and a sign of purity." },
      { q: "How should I store nuts and dry fruits?", a: "Keep them in an airtight container in a cool, dry place. In hot weather, the fridge keeps nuts crisp for longer." },
      { q: "Can I pay online?", a: "Yes. Besides Cash on Delivery you can pay by bank transfer or wallet (JazzCash, EasyPaisa, SadaPay). Some methods give an instant discount at checkout. We process the order once we verify your payment reference." },
      { q: "How do I use a coupon?", a: "Type the code in the coupon box at checkout and press Apply. The discount is shown immediately." },
      { q: "Can I track my order?", a: "Yes. Use the Track your order page with your order number and phone number." },
      { q: "Do you accept bulk or corporate orders?", a: "Yes. Message us on WhatsApp with quantities and your city and we will send a quote." },
    ],
    pages: { about: "", delivery: "", returns: "", privacy: "", terms: "" },
  };
}
