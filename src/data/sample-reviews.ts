/**
 * Sample testimonials used only for design preview. The people are invented.
 * They are shown while "Show sample testimonials" is on in Admin > Content,
 * and are never marked as verified buyers. Switch them off before launch.
 */
export interface SampleReview {
  name: string;
  city: string;
  product: string;
  comment: string;
  /** Urdu comments are written right to left. */
  lang: "en" | "ur";
  rating: number;
}

export const SAMPLE_REVIEWS: SampleReview[] = [
  { name: "عائشہ خان", city: "لاہور", product: "Sidr Honey", lang: "ur", rating: 5, comment: "شہد بالکل خالص ہے، ذائقہ اور خوشبو لاجواب۔ جار سیل بند اور محفوظ پہنچا۔ دوبارہ ضرور منگواؤں گی۔" },
  { name: "Hamza Ali", city: "Karachi", product: "California Almonds", lang: "en", rating: 5, comment: "Almonds were fresh and crunchy, nothing like the stale ones from the market. The 1kg pack reached me in two days." },
  { name: "فاطمہ نور", city: "اسلام آباد", product: "Gilgit Walnuts", lang: "ur", rating: 5, comment: "اخروٹ کا معیار شاندار ہے، مغز صاف اور تازہ۔ گھر میں سب کو بہت پسند آئے۔" },
  { name: "Bilal Ahmed", city: "Faisalabad", product: "Desi Cow Ghee", lang: "en", rating: 5, comment: "The ghee smells just like the one from our village. Grainy, golden and rich. Will order again." },
  { name: "ثنا ملک", city: "راولپنڈی", product: "Ajwa Dates", lang: "ur", rating: 5, comment: "عجوہ کھجوریں نرم اور میٹھی تھیں۔ رمضان کے لیے بہترین انتخاب، پیکنگ بھی صاف ستھری۔" },
  { name: "Usman Tariq", city: "Peshawar", product: "Royal Gift Hamper", lang: "en", rating: 5, comment: "Ordered a gift hamper for my in-laws. It looked premium and everything inside was fresh. They loved it." },
  { name: "مریم صدیقی", city: "ملتان", product: "Kashmiri Saffron", lang: "ur", rating: 5, comment: "زعفران کی خوشبو اور رنگ دونوں اصلی لگے۔ تھوڑا سا بھی کافی ہے، قیمت کے لحاظ سے بہت اچھا۔" },
  { name: "Ahmad Raza", city: "Quetta", product: "Kahwa Tea", lang: "en", rating: 4, comment: "The Kashmiri kahwa with saffron is now our evening ritual. Lovely aroma, and the tin keeps it fresh." },
  { name: "زینب حسین", city: "سیالکوٹ", product: "Cash on Delivery", lang: "ur", rating: 5, comment: "کیش آن ڈیلیوری کی سہولت بہت اچھی لگی۔ پارسل وقت پر اور بالکل محفوظ پہنچا۔" },
  { name: "Hassan Shah", city: "Hyderabad", product: "Winter Warmth Combo", lang: "en", rating: 5, comment: "Great value combo pack, and the WhatsApp support replied within minutes when I had a question about delivery." },
  { name: "حرا جاوید", city: "گوجرانوالہ", product: "Peanut Butter", lang: "ur", rating: 4, comment: "پینٹ بٹر میں چینی بالکل نہیں، ذائقہ قدرتی اور کرنچی۔ بچوں کو بہت پسند آیا۔" },
  { name: "Imran Qureshi", city: "Abbottabad", product: "Mountain Figs", lang: "en", rating: 5, comment: "Soft, sweet figs with no added sugar. Packed in a sealed pouch and delivered right on time." },
  { name: "نادیہ فاروق", city: "لاہور", product: "Honeycomb", lang: "ur", rating: 5, comment: "ہنی کومب بالکل قدرتی ہے، بچپن کا ذائقہ یاد آ گیا۔ بہت شکریہ۔" },
  { name: "Saad Mahmood", city: "Islamabad", product: "Mixed Dry Fruits", lang: "en", rating: 5, comment: "Neat packaging, fresh dry fruits and a fair price. Clearly sorted by hand. Highly recommended." },
];
