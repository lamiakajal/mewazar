import { Product } from "@/types";

export const allProducts: Product[] = [
  // ===================== 1. PURE HONEY (6 Products) =====================
  {
    id: "prod-1",
    isFeatured: true,
    name: "Kashmiri Organic Wild Honey",
    slug: "kashmiri-organic-wild-honey",
    category: "Honey",
    images: ["/products/kashmiri-organic-wild-honey.webp"],
    description:
      "Raw, 100% unfiltered and harvested straight from pristine Neelum Valley wild mountain blooms without heating or processing.",
    rating: 4.9,
    reviewsCount: 142,
    variants: [
      { weight: "250g", price: 950, stock: 25 },
      { weight: "500g", price: 1800, stock: 18 },
      { weight: "1kg", price: 3400, stock: 10 },
    ],
  },
  {
    id: "prod-2",
    isFeatured: true,
    name: "Sidr (Beri) Honey Premium Blend",
    slug: "sidr-beri-honey-premium",
    category: "Honey",
    images: ["/products/sidr-beri-honey-premium.webp"],
    description:
      "Monofloral nectar collected from ancient wild Sidr trees across the Karak region. Globally celebrated for supreme purity and immune vitality.",
    rating: 5.0,
    reviewsCount: 110,
    variants: [
      { weight: "250g", price: 1250, stock: 15 },
      { weight: "500g", price: 2400, stock: 10 },
      { weight: "1kg", price: 4600, stock: 5 },
    ],
  },
  {
    id: "prod-3",
    name: "Organic Acacia White Flower Honey",
    slug: "organic-acacia-white-flower-honey",
    category: "Honey",
    images: ["/products/organic-acacia-white-flower-honey.webp"],
    description:
      "Clear, delicate floral nectar with low glycemic index. Naturally fluid, subtly sweet, and light amber in texture.",
    rating: 4.8,
    reviewsCount: 64,
    variants: [
      { weight: "250g", price: 850, stock: 30 },
      { weight: "500g", price: 1600, stock: 20 },
      { weight: "1kg", price: 3100, stock: 12 },
    ],
  },
  {
    id: "prod-4",
    name: "Black Forest Mountain Honey",
    slug: "black-forest-mountain-honey",
    category: "Honey",
    images: ["/products/black-forest-mountain-honey.webp"],
    description:
      "Dark aromatic honeydew collected from pine forest flora. Rich in natural minerals, potassium, and antioxidants.",
    rating: 4.9,
    reviewsCount: 52,
    variants: [
      { weight: "250g", price: 1100, stock: 14 },
      { weight: "500g", price: 2150, stock: 8 },
      { weight: "1kg", price: 4100, stock: 4 },
    ],
  },
  {
    id: "prod-5",
    name: "Clover Blossom Raw Honey",
    slug: "clover-blossom-raw-honey",
    category: "Honey",
    images: ["/products/clover-blossom-raw-honey.webp"],
    description:
      "Classic mild golden honey harvested from sunny clover meadows. Smooth floral finish perfect for teas and baking.",
    rating: 4.7,
    reviewsCount: 41,
    variants: [
      { weight: "250g", price: 800, stock: 35 },
      { weight: "500g", price: 1500, stock: 22 },
      { weight: "1kg", price: 2900, stock: 15 },
    ],
  },
  {
    id: "prod-6",
    isFeatured: true,
    name: "Raw Honeycomb with Pure Mountain Nectar",
    slug: "raw-honeycomb-pure-mountain-nectar",
    category: "Honey",
    images: ["/products/raw-honeycomb-pure-mountain-nectar.webp"],
    description:
      "100% pure raw honeycomb cut straight from natural frames. Edible beeswax packed with living bee pollen and propolis.",
    rating: 5.0,
    reviewsCount: 38,
    variants: [
      { weight: "350g Comb", price: 1750, stock: 12 },
      { weight: "700g Comb", price: 3300, stock: 6 },
    ],
  },
  // ===================== 2. ALMONDS & NUTS (6 Products) =====================
  {
    id: "prod-7",
    isFeatured: true,
    name: "California Jumbo Almonds (Giri)",
    slug: "california-jumbo-almonds",
    category: "Nuts",
    images: ["art:nuts:almond"],
    description:
      "Crisp, sweet, and bursting with beneficial natural oils. Extra-large kernels handpicked for daily energy and vitality.",
    rating: 4.8,
    reviewsCount: 96,
    variants: [
      { weight: "250g", price: 750, stock: 45 },
      { weight: "500g", price: 1450, stock: 32 },
      { weight: "1kg", price: 2800, stock: 20 },
    ],
  },
  {
    id: "prod-8",
    name: "Kaghzi Badam (Soft Shell Pakistani Almonds)",
    slug: "kaghzi-badam-soft-shell-almonds",
    category: "Nuts",
    images: ["/products/kaghzi-badam-soft-shell-almonds.webp"],
    description:
      "Native Balochistan paper-shell almonds easily cracked with bare fingers. Rich aroma with high oil concentration.",
    rating: 4.9,
    reviewsCount: 82,
    variants: [
      { weight: "500g", price: 1350, stock: 28 },
      { weight: "1kg", price: 2600, stock: 18 },
    ],
  },
  {
    id: "prod-9",
    name: "Roasted Salted Pistachios (Pista)",
    slug: "roasted-salted-pistachios",
    category: "Nuts",
    images: ["art:nuts:pistachio"],
    description:
      "Naturally opened, gently slow-roasted with Himalayan pink salt. Crisp texture and deeply satisfying crunch.",
    rating: 4.7,
    reviewsCount: 73,
    variants: [
      { weight: "250g", price: 900, stock: 28 },
      { weight: "500g", price: 1750, stock: 19 },
      { weight: "1kg", price: 3400, stock: 11 },
    ],
  },
  {
    id: "prod-10",
    name: "Whole Roasted Cashews (Kaju)",
    slug: "whole-roasted-cashews-kaju",
    category: "Nuts",
    images: ["art:nuts:cashew"],
    description:
      "W240 export grade creamy white cashews. Lightly toasted to enhance their naturally buttery and rich texture.",
    rating: 4.9,
    reviewsCount: 81,
    variants: [
      { weight: "250g", price: 850, stock: 35 },
      { weight: "500g", price: 1650, stock: 24 },
      { weight: "1kg", price: 3200, stock: 15 },
    ],
  },
  {
    id: "prod-11",
    name: "Raw Brazil Nuts",
    slug: "raw-brazil-nuts",
    category: "Nuts",
    images: ["art:nuts:walnut"],
    description:
      "Unmatched source of dietary selenium. Large, nutty, crunchy kernels harvested from tropical Amazon rainforest canopies.",
    rating: 4.6,
    reviewsCount: 39,
    variants: [
      { weight: "250g", price: 990, stock: 16 },
      { weight: "500g", price: 1920, stock: 9 },
    ],
  },
  {
    id: "prod-12",
    name: "Raw Hazelnuts (Bunduq)",
    slug: "raw-hazelnuts-bunduq",
    category: "Nuts",
    images: ["art:nuts:hazelnut"],
    description:
      "Premium European round hazelnuts with a crisp earthy crunch. Ideal for smoothies, homemade nut butters, and energy bites.",
    rating: 4.8,
    reviewsCount: 34,
    variants: [
      { weight: "250g", price: 820, stock: 20 },
      { weight: "500g", price: 1600, stock: 14 },
    ],
  },
  // ===================== 3. ORGANIC DRY FRUITS (6 Products) =====================
  {
    id: "prod-13",
    isFeatured: true,
    name: "Mountain Walnuts (Akhrot Giri)",
    slug: "mountain-walnuts-akhrot",
    category: "Dry Fruits",
    images: ["art:dry-fruits:walnut"],
    description:
      "Fresh light-kernel Gilgit mountain walnuts packed with plant-based Omega-3 fatty acids and memory enhancers.",
    rating: 5.0,
    reviewsCount: 88,
    variants: [
      { weight: "250g", price: 850, stock: 30 },
      { weight: "500g", price: 1650, stock: 22 },
      { weight: "1kg", price: 3200, stock: 14 },
    ],
  },
  {
    id: "prod-14",
    name: "Sundried Afghan Green Raisins (Kishmish)",
    slug: "sundried-afghan-green-raisins",
    category: "Dry Fruits",
    images: ["art:dry-fruits:graisin"],
    description:
      "Extra long green raisins naturally dried under warm alpine sun. Sweet, seedless, and loaded with natural iron.",
    rating: 4.8,
    reviewsCount: 62,
    variants: [
      { weight: "250g", price: 450, stock: 50 },
      { weight: "500g", price: 850, stock: 35 },
      { weight: "1kg", price: 1600, stock: 20 },
    ],
  },
  {
    id: "prod-15",
    name: "Kandahar Dried Organic Figs (Anjeer)",
    slug: "kandahar-dried-organic-figs-anjeer",
    category: "Dry Fruits",
    images: ["art:dry-fruits:fig"],
    description:
      "Jumbo hand-threaded dried figs with natural crunchy seeds inside. Traditional superfood for digestive health and stamina.",
    rating: 4.9,
    reviewsCount: 94,
    variants: [
      { weight: "250g", price: 890, stock: 25 },
      { weight: "500g", price: 1700, stock: 18 },
      { weight: "1kg", price: 3300, stock: 10 },
    ],
  },
  {
    id: "prod-16",
    name: "Dried Seedless Turkish Apricots",
    slug: "dried-seedless-turkish-apricots",
    category: "Dry Fruits",
    images: ["art:dry-fruits:apricot"],
    description:
      "Golden sweet sundried whole apricots. Moist, tender, and rich in natural Vitamin A and dietary fiber.",
    rating: 4.7,
    reviewsCount: 45,
    variants: [
      { weight: "250g", price: 550, stock: 38 },
      { weight: "500g", price: 1050, stock: 24 },
      { weight: "1kg", price: 2000, stock: 16 },
    ],
  },
  {
    id: "prod-17",
    name: "Royal Black Raisins (Munakka)",
    slug: "royal-black-raisins-munakka",
    category: "Dry Fruits",
    images: ["art:dry-fruits:raisin"],
    description:
      "Large fleshy seeded black raisins known in Ayurvedic and Unani traditions for strengthening bone density and blood circulation.",
    rating: 4.8,
    reviewsCount: 57,
    variants: [
      { weight: "250g", price: 520, stock: 30 },
      { weight: "500g", price: 990, stock: 20 },
      { weight: "1kg", price: 1900, stock: 12 },
    ],
  },
  {
    id: "prod-18",
    isFeatured: true,
    name: "Medjool Luxury Dates (Khajoor)",
    slug: "medjool-luxury-dates-khajoor",
    category: "Dates",
    images: ["art:dates:date"],
    description:
      "King of Dates: Large, plump, naturally caramel-sweet fruit with velvety soft texture. Handpicked during peak harvest.",
    rating: 5.0,
    reviewsCount: 115,
    variants: [
      { weight: "500g Box", price: 1450, stock: 40 },
      { weight: "1kg Box", price: 2800, stock: 25 },
    ],
  },
  // ===================== 4. HEALTHY SEEDS (4 Products) =====================
  {
    id: "prod-19",
    name: "Organic Chia & Basil Seeds Trio",
    slug: "chia-basil-seeds-trio",
    category: "Seeds",
    images: ["art:seeds:seed"],
    description:
      "Cleaned, raw whole black chia seeds and sweet tukhm-e-balanga. Essential morning companion for weight balance.",
    rating: 4.8,
    reviewsCount: 51,
    variants: [
      { weight: "250g", price: 450, stock: 60 },
      { weight: "500g", price: 850, stock: 40 },
      { weight: "1kg", price: 1600, stock: 25 },
    ],
  },
  {
    id: "prod-20",
    name: "Roasted Pumpkin & Sunflower Seeds",
    slug: "roasted-pumpkin-sunflower-seeds",
    category: "Seeds",
    images: ["art:seeds:seed"],
    description:
      "Crunchy pepitas and shelled sunflower seeds lightly salted. Abundant in zinc, magnesium, and plant protein.",
    rating: 4.9,
    reviewsCount: 38,
    variants: [
      { weight: "250g", price: 490, stock: 35 },
      { weight: "500g", price: 950, stock: 20 },
    ],
  },
  {
    id: "prod-21",
    name: "Golden Raw Flaxseeds (Alsi)",
    slug: "golden-raw-flaxseeds-alsi",
    category: "Seeds",
    images: ["art:seeds:seed"],
    description:
      "High-lignan golden flaxseeds packed with soluble dietary fiber and cardiovascular support nutrients.",
    rating: 4.6,
    reviewsCount: 29,
    variants: [
      { weight: "250g", price: 320, stock: 50 },
      { weight: "500g", price: 600, stock: 30 },
    ],
  },
  {
    id: "prod-22",
    name: "Organic Raw White Sesame Seeds (Til)",
    slug: "organic-raw-white-sesame-seeds-til",
    category: "Seeds",
    images: ["art:seeds:seed"],
    description:
      "Pristine natural white sesame seeds. Exceptional plant-based calcium provider for bones and winter traditional sweets.",
    rating: 4.7,
    reviewsCount: 33,
    variants: [
      { weight: "250g", price: 350, stock: 45 },
      { weight: "500g", price: 680, stock: 25 },
    ],
  },
  // ===================== 5. LUXURY GIFT BOXES (4 Products) =====================
  {
    id: "prod-23",
    isFeatured: true,
    name: "Royal Dry Fruit Gift Hamper",
    slug: "royal-dry-fruit-gift-hamper",
    category: "Gift Boxes",
    images: ["art:gift-boxes:gift"],
    description:
      "Handcrafted pine-wood chest loaded with 4 partitioned compartments containing premium cashews, pistachios, raisins, and walnuts.",
    rating: 5.0,
    reviewsCount: 84,
    variants: [
      { weight: "800g Hamper", price: 3499, stock: 15 },
      { weight: "1.5kg Luxury Chest", price: 6200, stock: 8 },
    ],
  },
  {
    id: "prod-24",
    name: "Festive Velvet Celebration Box",
    slug: "festive-velvet-celebration-box",
    category: "Gift Boxes",
    images: ["art:gift-boxes:gift"],
    description:
      "Regal emerald green velvet box packaged with royal roasted almonds, saffron infusion jar, and golden dried figs.",
    rating: 4.9,
    reviewsCount: 47,
    variants: [{ weight: "1kg Box", price: 4799, stock: 12 }],
  },
  {
    id: "prod-25",
    name: "Imperial Saffron & Nut Treasure Box",
    slug: "imperial-saffron-nut-treasure-box",
    category: "Gift Boxes",
    images: ["art:gift-boxes:gift"],
    description:
      "Exclusive artisanal gold-foil embossed box featuring 2g pure Kashmiri Mongra Saffron, jumbo pistachios, and roasted cashews.",
    rating: 5.0,
    reviewsCount: 31,
    variants: [{ weight: "750g Box", price: 5899, stock: 7 }],
  },
  {
    id: "prod-26",
    name: "Corporate Executive Gift Platter",
    slug: "corporate-executive-gift-platter",
    category: "Gift Boxes",
    images: ["art:gift-boxes:gift"],
    description:
      "Laser-etched bamboo presentation platter arranged with premium dry fruit assortment and miniature pure Sidr honey jar.",
    rating: 4.8,
    reviewsCount: 26,
    variants: [{ weight: "1.2kg Platter", price: 5200, stock: 10 }],
  },
  // ===================== 6. SPECIAL COMBOS (4 Products) =====================
  {
    id: "prod-27",
    name: "Ramadan Energy Mega Combo",
    slug: "ramadan-energy-mega-combo",
    category: "Combos",
    images: ["art:combos:combo"],
    description:
      "Complete wellness trio: 500g Pure Wild Honey, 500g California Almonds, and 500g Gilgit Walnuts at special discounted pack pricing.",
    rating: 4.9,
    reviewsCount: 118,
    variants: [{ weight: "1.5kg Combo Pack", price: 4499, comparePrice: 5170, stock: 30 }],
  },
  {
    id: "prod-28",
    name: "Immunity Boost Breakfast Duo",
    slug: "immunity-boost-breakfast-duo",
    category: "Combos",
    images: ["art:combos:combo"],
    description:
      "Morning power bundle featuring 500g Kashmiri Organic Wild Honey paired with 500g Chia & Basil Seeds mix.",
    rating: 4.8,
    reviewsCount: 67,
    variants: [{ weight: "1kg Duo Pack", price: 2350, comparePrice: 2700, stock: 22 }],
  },
  {
    id: "prod-29",
    name: "Student Memory & Focus Bundle",
    slug: "student-memory-focus-bundle",
    category: "Combos",
    images: ["art:combos:combo"],
    description:
      "Exam preparation pack containing 500g Mountain Walnuts and 500g California Jumbo Almonds for sustained mental focus.",
    rating: 4.9,
    reviewsCount: 85,
    variants: [{ weight: "1kg Bundle", price: 2950, comparePrice: 3390, stock: 35 }],
  },
  {
    id: "prod-30",
    isFeatured: true,
    name: "Winter Warmth Traditional Pack",
    slug: "winter-warmth-traditional-pack",
    category: "Combos",
    images: ["art:combos:combo"],
    description:
      "Traditional cold weather bundle: 500g Sidr Honey, 500g Roasted Salted Pistachios, and 250g Kandahar Dried Figs.",
    rating: 5.0,
    reviewsCount: 92,
    variants: [{ weight: "1.25kg Winter Pack", price: 4850, comparePrice: 5580, stock: 18 }],
  },
  // ===================== NEW CATEGORIES (Dates, Spices, Tea, Oils & Ghee, Spreads) =====================
  {
    id: "prod-31",
    name: "Ajwa Dates of Madinah",
    slug: "ajwa-dates-madinah",
    category: "Dates",
    isFeatured: true,
    isNew: true,
    images: ["art:dates:date"],
    description:
      "Soft, dark and gently sweet Ajwa dates with a rich fudge-like bite. Packed in a sealed tray to stay fresh.",
    rating: 4.9,
    reviewsCount: 76,
    variants: [
      { weight: "500g Box", price: 2200, stock: 30 },
      { weight: "1kg Box", price: 4200, stock: 18 },
    ],
  },
  {
    id: "prod-32",
    name: "Sukkari Golden Dates",
    slug: "sukkari-golden-dates",
    category: "Dates",
    isNew: true,
    images: ["art:dates:date"],
    description:
      "Honey-sweet, crisp-edged golden dates that melt in the mouth. A favourite for iftar tables and gifting.",
    rating: 4.8,
    reviewsCount: 58,
    variants: [
      { weight: "500g Box", price: 1250, stock: 40 },
      { weight: "1kg Box", price: 2400, stock: 26 },
    ],
  },
  {
    id: "prod-33",
    name: "Mabroom Premium Dates",
    slug: "mabroom-premium-dates",
    category: "Dates",
    isNew: true,
    images: ["art:dates:date"],
    description:
      "Long, chewy and mildly sweet dates with a deep caramel flavour, hand-sorted for size and softness.",
    rating: 4.7,
    reviewsCount: 41,
    variants: [
      { weight: "500g Box", price: 1450, stock: 28 },
      { weight: "1kg Box", price: 2750, stock: 16 },
    ],
  },
  {
    id: "prod-34",
    name: "Khudri Soft Dates",
    slug: "khudri-soft-dates",
    category: "Dates",
    isNew: true,
    images: ["art:dates:date"],
    description:
      "Everyday soft dates with a toffee-like taste and a tender skin. Great for smoothies and baking.",
    rating: 4.6,
    reviewsCount: 33,
    variants: [
      { weight: "500g", price: 780, stock: 50 },
      { weight: "1kg", price: 1500, stock: 34 },
    ],
  },
  {
    id: "prod-35",
    name: "Kashmiri Mongra Saffron",
    slug: "kashmiri-mongra-saffron",
    category: "Spices",
    isFeatured: true,
    isNew: true,
    images: ["art:spices:saffron"],
    description:
      "Deep red, hand-picked saffron threads with a strong aroma and colour. A few strands go a long way.",
    rating: 5.0,
    reviewsCount: 64,
    variants: [
      { weight: "1g Tin", price: 750, stock: 40 },
      { weight: "2g Tin", price: 1400, stock: 25 },
      { weight: "5g Tin", price: 3300, stock: 12 },
    ],
  },
  {
    id: "prod-36",
    name: "Black Cumin Seeds (Kalonji)",
    slug: "black-cumin-kalonji",
    category: "Spices",
    isNew: true,
    images: ["art:spices:cumin"],
    description:
      "Aromatic whole kalonji seeds with a peppery, slightly bitter flavour for breads, pickles and curries.",
    rating: 4.7,
    reviewsCount: 47,
    variants: [
      { weight: "100g", price: 260, stock: 60 },
      { weight: "250g", price: 580, stock: 40 },
    ],
  },
  {
    id: "prod-37",
    name: "Himalayan Pink Salt, Coarse",
    slug: "himalayan-pink-salt-coarse",
    category: "Spices",
    isNew: true,
    images: ["art:spices:salt"],
    description:
      "Coarse mineral-rich crystals for grinders and everyday cooking. Unrefined and free from additives.",
    rating: 4.8,
    reviewsCount: 92,
    variants: [
      { weight: "500g", price: 320, stock: 80 },
      { weight: "1kg", price: 590, stock: 55 },
    ],
  },
  {
    id: "prod-38",
    name: "Green Cardamom (Elaichi)",
    slug: "green-cardamom-elaichi",
    category: "Spices",
    isNew: true,
    images: ["art:spices:cardamom"],
    description:
      "Plump, fragrant green pods for chai, desserts and rice dishes. Sealed in an airtight tin to lock in aroma.",
    rating: 4.8,
    reviewsCount: 52,
    variants: [
      { weight: "50g", price: 650, stock: 45 },
      { weight: "100g", price: 1200, stock: 30 },
    ],
  },
  {
    id: "prod-39",
    name: "Kashmiri Kahwa Tea",
    slug: "kashmiri-kahwa-tea",
    category: "Tea",
    isFeatured: true,
    isNew: true,
    images: ["art:tea:leaf"],
    description:
      "Traditional green tea blended with saffron, cardamom and cinnamon. Brew it with a spoon of honey.",
    rating: 4.9,
    reviewsCount: 71,
    variants: [
      { weight: "50g Tin", price: 780, stock: 40 },
      { weight: "100g Tin", price: 1450, stock: 26 },
    ],
  },
  {
    id: "prod-40",
    name: "Hunza Mountain Green Tea",
    slug: "hunza-mountain-green-tea",
    category: "Tea",
    isNew: true,
    images: ["art:tea:leaf"],
    description:
      "Light, grassy loose-leaf green tea with a clean finish. Perfect for a calm morning cup.",
    rating: 4.6,
    reviewsCount: 39,
    variants: [
      { weight: "100g", price: 650, stock: 50 },
      { weight: "250g", price: 1450, stock: 30 },
    ],
  },
  {
    id: "prod-41",
    name: "Chamomile & Mint Herbal Blend",
    slug: "chamomile-mint-herbal-blend",
    category: "Tea",
    isNew: true,
    images: ["art:tea:leaf"],
    description:
      "A caffeine-free blend of chamomile flowers and cool peppermint for slow evenings.",
    rating: 4.7,
    reviewsCount: 44,
    variants: [
      { weight: "75g", price: 560, stock: 45 },
      { weight: "150g", price: 1050, stock: 28 },
    ],
  },
  {
    id: "prod-42",
    name: "Masala Chai Blend",
    slug: "masala-chai-blend",
    category: "Tea",
    isNew: true,
    images: ["art:tea:leaf"],
    description:
      "Strong black tea with ginger, cardamom and clove, ready for a proper milky cup of chai.",
    rating: 4.8,
    reviewsCount: 83,
    variants: [
      { weight: "200g", price: 520, stock: 70 },
      { weight: "500g", price: 1180, stock: 40 },
    ],
  },
  {
    id: "prod-43",
    name: "Pure Desi Cow Ghee",
    slug: "pure-desi-cow-ghee",
    category: "Oils & Ghee",
    isFeatured: true,
    isNew: true,
    images: ["art:oils-ghee:ghee"],
    description:
      "Slow-simmered desi ghee with a nutty aroma and a grainy, golden texture. Made in small batches.",
    rating: 4.9,
    reviewsCount: 128,
    variants: [
      { weight: "500g", price: 2600, stock: 30 },
      { weight: "1kg", price: 5000, stock: 20 },
    ],
  },
  {
    id: "prod-44",
    name: "Cold-Pressed Black Seed Oil",
    slug: "cold-pressed-black-seed-oil",
    category: "Oils & Ghee",
    isNew: true,
    images: ["art:oils-ghee:oil"],
    description:
      "Dark, bold oil pressed from kalonji seeds at low temperature, bottled in amber glass.",
    rating: 4.7,
    reviewsCount: 49,
    variants: [
      { weight: "100ml", price: 850, stock: 40 },
      { weight: "250ml", price: 1900, stock: 22 },
    ],
  },
  {
    id: "prod-45",
    name: "Extra Virgin Olive Oil",
    slug: "extra-virgin-olive-oil",
    category: "Oils & Ghee",
    isNew: true,
    images: ["art:oils-ghee:oil"],
    description:
      "Fruity, peppery first cold-press oil for salads, dips and finishing. Stored in a dark bottle.",
    rating: 4.8,
    reviewsCount: 66,
    variants: [
      { weight: "500ml", price: 2300, stock: 35 },
      { weight: "1L", price: 4300, stock: 20 },
    ],
  },
  {
    id: "prod-46",
    name: "Cold-Pressed Almond Oil",
    slug: "cold-pressed-almond-oil",
    category: "Oils & Ghee",
    isNew: true,
    images: ["art:oils-ghee:oil"],
    description:
      "Light, nutty almond oil for cooking, baking and everyday use. Pressed without solvents or heat.",
    rating: 4.7,
    reviewsCount: 37,
    variants: [
      { weight: "100ml", price: 950, stock: 40 },
      { weight: "250ml", price: 2100, stock: 24 },
    ],
  },
  {
    id: "prod-47",
    name: "Stone-Ground Almond Butter",
    slug: "stone-ground-almond-butter",
    category: "Spreads",
    isNew: true,
    images: ["art:spreads:butter"],
    description:
      "Smooth, roasted almond butter with nothing added except a pinch of salt. Stir before you spread.",
    rating: 4.8,
    reviewsCount: 61,
    variants: [
      { weight: "250g Jar", price: 1250, stock: 35 },
      { weight: "500g Jar", price: 2300, stock: 22 },
    ],
  },
  {
    id: "prod-48",
    name: "Crunchy Peanut Butter",
    slug: "crunchy-peanut-butter",
    category: "Spreads",
    isNew: true,
    images: ["art:spreads:butter"],
    description:
      "Roasted peanuts ground in small batches, with real crunchy pieces and no added oil or sugar.",
    rating: 4.7,
    reviewsCount: 88,
    variants: [
      { weight: "340g Jar", price: 620, stock: 60 },
      { weight: "750g Jar", price: 1250, stock: 38 },
    ],
  },
  {
    id: "prod-49",
    name: "Walnut & Date Spread",
    slug: "walnut-date-spread",
    category: "Spreads",
    isNew: true,
    images: ["art:spreads:butter"],
    description:
      "A thick, naturally sweet spread of mountain walnuts and soft dates. Great on toast and parathas.",
    rating: 4.6,
    reviewsCount: 29,
    variants: [
      { weight: "250g Jar", price: 980, stock: 30 },
    ],
  },
  {
    id: "prod-50",
    name: "Honey Hazelnut Spread",
    slug: "honey-hazelnut-spread",
    category: "Spreads",
    isNew: true,
    images: ["art:spreads:butter"],
    description:
      "Roasted hazelnuts blended with raw honey into a silky spread with no palm oil.",
    rating: 4.8,
    reviewsCount: 35,
    variants: [
      { weight: "250g Jar", price: 1150, stock: 28 },
    ],
  },
];

/** Looks up a product by its URL slug. */
export const getProductBySlug = (slug: string) =>
  allProducts.find((p) => p.slug === slug);

/** Products flagged as featured, used on the home page. */
export const featuredProducts = allProducts.filter((p) => p.isFeatured);

/** Products flagged as new arrivals. */
export const newArrivals = allProducts.filter((p) => p.isNew);

/** Highest starting price across the catalog, used for the price filter. */
export const maxCatalogPrice = Math.max(
  ...allProducts.map((p) => Math.min(...p.variants.map((v) => v.price))),
);
