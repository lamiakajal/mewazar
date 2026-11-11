/**
 * What a moderator can be allowed to do. The owner (admin) can always do everything and
 * alone can open Settings (payment accounts, coupons), Staff and Activity.
 */
export const PERMISSIONS = [
  { key: "orders", label: "Orders", desc: "View orders, update status, verify payments, add courier details, print invoices" },
  { key: "products", label: "Products and stock", desc: "Add, edit, hide and delete products, change prices and stock, upload photos" },
  { key: "reviews", label: "Reviews", desc: "Approve, unpublish or delete customer reviews" },
  { key: "messages", label: "Messages", desc: "Read and answer messages from the Contact page" },
  { key: "customers", label: "Customers and coins", desc: "See customers and add or remove reward coins" },
  { key: "categories", label: "Categories", desc: "Add, rename, recolour and reorder categories" },
  { key: "content", label: "Content", desc: "Edit the shop name, logo, home page text, FAQ, About page and policies" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

/** Pre-selected when the owner adds a new moderator. */
export const DEFAULT_MODERATOR_PERMISSIONS: PermissionKey[] = ["orders", "reviews", "messages"];

export const isPermissionKey = (v: unknown): v is PermissionKey =>
  typeof v === "string" && (PERMISSION_KEYS as string[]).includes(v);
