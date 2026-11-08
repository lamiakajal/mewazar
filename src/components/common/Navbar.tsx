"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  LayoutDashboard,
  Coins,
  LogOut,
  Menu,
  Package,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  User as UserIcon,
  X,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSettings } from "@/context/SettingsContext";
import { whatsappLink } from "@/data/brand";
import { formatPrice } from "@/lib/format";

interface Suggestion {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
}

const emptySubscribe = () => () => {};

const BASE_LINKS = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop", mega: true },
  { name: "Gift Boxes", href: "/shop?cat=gift-boxes" },
  { name: "Combos", href: "/shop?cat=combos" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const {
    contact,
    shipping,
    announcement,
    saleCount,
    rewards,
    categories: CATEGORIES,
    brand,
  } = useSettings();
  // A "Sale" link appears automatically while at least one product has a discount
  const NAV_LINKS: {
    name: string;
    href: string;
    mega?: boolean;
    badge?: string;
  }[] =
    saleCount > 0
      ? [
          ...BASE_LINKS.slice(0, 4),
          { name: "Sale", href: "/shop?cat=sale", badge: "Hot" },
          ...BASE_LINKS.slice(4),
        ]
      : BASE_LINKS;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatches for values that come from localStorage.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const wishlistCount = mounted ? wishlist.length : 0;
  const cartCount = mounted ? totalItems : 0;

  // Live search suggestions (debounced request to /api/search)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(data.results ?? []);
      } catch {
        // Aborted or offline: keep the previous suggestions
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  const visibleSuggestions = query.trim().length >= 2 ? suggestions : [];

  // Compact header after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close menus on outside click or Escape
  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const closeAll = () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/shop?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  };

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (href.includes("?")) return false;
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  };

  const isAuthed = mounted && status === "authenticated" && !!session?.user;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-70 focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-bold focus:text-gold-ink"
      >
        Skip to content
      </a>

      {/* Top info bar */}
      <div className="site-chrome bg-brand-950 text-gold-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 font-medium">
            <Truck className="hidden h-3.5 w-3.5 text-gold-400 sm:block" />
            {announcement.enabled && announcement.text ? (
              announcement.link ? (
                <Link
                  href={announcement.link}
                  className="hover:text-white hover:underline"
                >
                  {announcement.text}
                </Link>
              ) : (
                <span>{announcement.text}</span>
              )
            ) : (
              <span>
                Free delivery over{" "}
                <strong>{formatPrice(shipping.freeThreshold)}</strong>
                <span className="hidden sm:inline">
                  {" "}
                  with Cash on Delivery nationwide
                </span>
              </span>
            )}
          </p>
          <a
            href={whatsappLink(undefined, contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 font-semibold transition hover:text-white sm:flex"
          >
            <Phone className="h-3 w-3 text-gold-400" />
            <span>Helpline {contact.phone}</span>
          </a>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`site-chrome sticky top-0 z-40 border-b border-stone-200/70 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? "shadow-soft" : ""
        }`}
        style={{ background: "var(--header-bg)" }}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <Link
            href="/"
            onClick={closeAll}
            aria-label={`${brand.name} home`}
            className="shrink-0"
          >
            <Logo
              name={brand.name}
              tagline={brand.tagline}
              logoUrl={brand.logoUrl}
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <div key={link.name} className="group relative">
                <Link
                  href={link.href}
                  className={`relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive(link.href)
                      ? "text-heading"
                      : "text-stone-600 hover:text-heading"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.mega && (
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                  )}
                  {link.badge && (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                      {link.badge}
                    </span>
                  )}
                  <span
                    className={`absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-gold-500 transition-transform duration-300 ${
                      isActive(link.href)
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>

                {link.mega && (
                  <div className="invisible absolute left-1/2 top-full w-136 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="grid grid-cols-2 gap-1 rounded-2xl border border-stone-200 bg-surface p-3 shadow-lift">
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/shop?cat=${cat.slug}`}
                          className="group/item flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-stone-100"
                        >
                          <span
                            className="hex h-9 w-8 shrink-0"
                            style={{
                              background: `linear-gradient(160deg, ${cat.from}, ${cat.to})`,
                            }}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-stone-800 group-hover/item:text-heading">
                              {cat.label}
                            </span>
                            <span className="block truncate text-[11px] text-stone-500">
                              {cat.blurb}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search products"
              aria-expanded={searchOpen}
              className={`grid h-10 w-10 place-items-center rounded-full transition cursor-pointer ${
                searchOpen
                  ? "bg-gold-100 text-gold-800"
                  : "text-stone-600 hover:bg-stone-100 hover:text-heading"
              }`}
            >
              <Search className="h-5 w-5" />
            </button>

            <ThemeToggle />

            <Link
              href="/wishlist"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} saved` : ""}`}
              className="relative hidden h-10 w-10 place-items-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-rose-500 sm:grid"
            >
              <Heart
                className={`h-5 w-5 transition ${wishlistCount ? "fill-rose-500 text-rose-500" : ""}`}
              />
              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart${cartCount ? `, ${cartCount} items` : ""}`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-heading cursor-pointer"
            >
              <ShoppingBag
                key={`bag-${cartCount}`}
                className={`h-5 w-5 ${cartCount > 0 ? "animate-wiggle" : ""}`}
              />
              {cartCount > 0 && (
                <span
                  key={`badge-${cartCount}`}
                  className="animate-pop absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-gold-ink"
                >
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthed ? (
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                  className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-primary text-xs font-bold text-white ring-2 ring-transparent transition hover:ring-gold-500 cursor-pointer"
                >
                  {session?.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    session?.user?.name?.charAt(0).toUpperCase() || "U"
                  )}
                </button>

                {userMenuOpen && (
                  <div className="animate-fade-in absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-stone-200 bg-surface py-2 shadow-lift">
                    <div className="border-b border-stone-100 px-4 py-2">
                      <p className="truncate text-sm font-bold text-stone-800">
                        {session?.user?.name}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {session?.user?.email}
                      </p>
                    </div>
                    {(session?.user as { role?: string } | undefined)?.role ===
                      "admin" && (
                      <Link
                        href="/admin"
                        onClick={closeAll}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-heading transition hover:bg-stone-50"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gold-600" />
                        Admin panel
                      </Link>
                    )}
                    {rewards.enabled && (
                      <Link
                        href="/rewards"
                        onClick={closeAll}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                      >
                        <Coins className="h-4 w-4 text-gold-600" />
                        Reward coins
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      onClick={closeAll}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                    >
                      <Package className="h-4 w-4 text-gold-600" />
                      My orders
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeAll();
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-1 hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-hover sm:inline-flex"
              >
                <UserIcon className="h-4 w-4" />
                Sign in
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full text-stone-700 transition hover:bg-stone-100 lg:hidden cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="animate-fade-in border-t border-stone-200/70 bg-surface/95 px-4 py-4 sm:px-6">
            <form
              onSubmit={submitSearch}
              className="mx-auto max-w-3xl"
              role="search"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search honey, almonds, dates, saffron, ghee..."
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 py-3.5 pl-12 pr-28 text-sm text-stone-800 placeholder:text-stone-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  autoFocus
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-hover cursor-pointer"
                >
                  Search
                </button>
              </div>

              {visibleSuggestions.length > 0 ? (
                <ul className="mt-3 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-surface">
                  {visibleSuggestions.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={closeAll}
                        className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-stone-50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-stone-800">
                            {p.name}
                          </span>
                          <span className="text-xs text-stone-500">
                            {p.category}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-heading">
                          From {formatPrice(p.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORIES.slice(0, 7).map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop?cat=${cat.slug}`}
                      onClick={closeAll}
                      className="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:border-gold-500 hover:text-heading"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </form>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-9998 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="animate-fade-in absolute inset-0 bg-brand-950/60 backdrop-blur-sm cursor-pointer"
          />
          <div className="animate-slide-in-right absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <Logo
                name={brand.name}
                logoUrl={brand.logoUrl}
                showTagline={false}
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={closeAll}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 text-base font-bold transition ${
                        isActive(link.href)
                          ? "bg-gold-100 text-gold-800"
                          : "text-stone-800 hover:bg-stone-50"
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mb-2 mt-6 px-3 text-xs font-bold text-stone-500">
                Shop by category
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/shop?cat=${cat.slug}`}
                      onClick={closeAll}
                      className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 text-xs font-semibold text-stone-700 transition hover:border-gold-500"
                    >
                      <span
                        className="hex h-5 w-4.5 shrink-0"
                        style={{
                          background: `linear-gradient(160deg, ${cat.from}, ${cat.to})`,
                        }}
                      />
                      <span className="truncate">{cat.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-stone-200 px-5 py-4">
              <Link
                href="/wishlist"
                onClick={closeAll}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" /> Wishlist
                </span>
                {wishlistCount > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {isAuthed ? (
                <>
                  {rewards.enabled && (
                    <Link
                      href="/rewards"
                      onClick={closeAll}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      <Coins className="h-4 w-4 text-gold-600" /> Reward coins
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    onClick={closeAll}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    <Package className="h-4 w-4 text-gold-600" /> My orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeAll();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeAll}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white"
                >
                  <UserIcon className="h-4 w-4" /> Sign in or create account
                </Link>
              )}

              <a
                href={whatsappLink(undefined, contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white"
              >
                Order on WhatsApp <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
