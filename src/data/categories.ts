export type ArtKind = "jar" | "pouch" | "bottle" | "box" | "tin";

export interface CategoryMeta {
  slug: string;
  name: string;
  label: string;
  blurb: string;
  art: ArtKind;
  /** Tile colors used by the illustrated fallback and category cards. */
  from: string;
  to: string;
  badge?: string;
  /** Optional cover photo for the home page tile. Without one, the best product photo is used. */
  image?: string;
}

// Single source of truth for categories (navbar, footer, shop filters, home grid).
export const CATEGORIES: CategoryMeta[] = [
  { slug: "honey", name: "Honey", label: "Pure Honey", blurb: "Wild Sidr, acacia and forest honey, raw and unheated.", art: "jar", from: "#F5C961", to: "#E9A31A", image: "/products/pure-honey.webp" },
  { slug: "nuts", name: "Nuts", label: "Almonds & Nuts", blurb: "Jumbo almonds, pistachios, cashews and more.", art: "pouch", from: "#E8C9A0", to: "#C99863" },
  { slug: "dry-fruits", name: "Dry Fruits", label: "Dry Fruits", blurb: "Walnuts, figs, apricots and sun-dried raisins.", art: "pouch", from: "#E6B7A0", to: "#C9795B" },
  { slug: "dates", name: "Dates", label: "Premium Dates", blurb: "Ajwa, Medjool, Sukkari and Mabroom dates.", art: "box", from: "#C99A7A", to: "#7A4A32" },
  { slug: "seeds", name: "Seeds", label: "Healthy Seeds", blurb: "Chia, flax, pumpkin, sesame and sunflower.", art: "pouch", from: "#C9DB8E", to: "#8FAE4A" },
  { slug: "spices", name: "Spices", label: "Spices & Saffron", blurb: "Kashmiri saffron, black cumin and whole spices.", art: "tin", from: "#F2A27C", to: "#D2542B" },
  { slug: "tea", name: "Tea", label: "Tea & Herbs", blurb: "Kahwa, green tea and mountain herbal blends.", art: "tin", from: "#B7D6B0", to: "#5E9A63" },
  { slug: "oils-ghee", name: "Oils & Ghee", label: "Oils & Desi Ghee", blurb: "Cold-pressed oils and slow-churned desi ghee.", art: "bottle", from: "#F3DD8A", to: "#C9A227" },
  { slug: "spreads", name: "Spreads", label: "Nut Butters", blurb: "Stone-ground almond, peanut and walnut spreads.", art: "jar", from: "#E4C29B", to: "#A9703C" },
  { slug: "gift-boxes", name: "Gift Boxes", label: "Gift Boxes", blurb: "Hand-packed hampers for family and events.", art: "box", from: "#C48BB8", to: "#6B2A62" },
  { slug: "combos", name: "Combos", label: "Value Combos", blurb: "Bundles that save you more on daily favourites.", art: "box", from: "#9FCFA0", to: "#3E8A4D", badge: "Sale" },
];

/** Look up a category by URL slug (pass the owner-managed list; defaults to the starter list). */
export const categoryBySlug = (slug: string | null | undefined, list: CategoryMeta[] = CATEGORIES) =>
  list.find((c) => c.slug === slug);

/** Look up a category by its name as stored on products. */
export const categoryByName = (name: string, list: CategoryMeta[] = CATEGORIES) =>
  list.find((c) => c.name === name);
