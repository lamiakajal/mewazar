import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import CartToast from "@/components/cart/CartToast";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import AuthProvider from "@/components/common/AuthProvider";
import Loader from "@/components/ui/Loader";
import ScrollProgress from "@/components/ui/ScrollProgress";
import BackToTop from "@/components/ui/BackToTop";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { getSettings, toPublicSettings } from "@/lib/settings";
import { getAllProducts } from "@/lib/catalog";
import { BRAND } from "@/data/brand";

// Font CSS variables must not share a name with the Tailwind theme variables
// (--font-sans / --font-display), otherwise they reference themselves.
const bodyFont = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

// Urdu text (testimonials). Not preloaded, so visitors who never see Urdu do not pay for it.
const urduFont = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-ur",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSettings();

  return {
    metadataBase: new URL(BRAND.siteUrl),
    title: {
      default: `${brand.name} | Raw Honey, Nuts & Dry Fruits in Pakistan`,
      template: `%s | ${brand.name}`,
    },
    description:
      "Buy raw Sidr honey, Gilgit walnuts, California almonds, premium dates, saffron and desi ghee online with nationwide Cash on Delivery in Pakistan.",
    applicationName: brand.name,
    openGraph: {
      type: "website",
      siteName: brand.name,
      title: `${brand.name} | ${BRAND.slogan}`,
      description:
        "Raw honey, mountain dry fruits, dates, spices and pantry staples, packed in small batches.",
      locale: "en_PK",
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#150c16" },
  ],
};

// Runs before first paint: applies the saved/system theme (no flash) and
// marks repeat visits in the same session so the splash screen is skipped.
const bootScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('mewazar-theme');var dark=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(dark)d.classList.add('dark');if(sessionStorage.getItem('mewazar-visited'))d.classList.add('no-loader');else sessionStorage.setItem('mewazar-visited','1');}catch(e){}})();`;

// Pages re-read the catalog and settings at most once a minute (saving in /admin refreshes sooner)
export const revalidate = 60;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, products] = await Promise.all([getSettings(), getAllProducts()]);
  const saleCount = products.filter((p) => p.variants.some((v) => v.comparePrice && v.comparePrice > v.price)).length;

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} ${urduFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="bg-canvas font-sans text-stone-900 antialiased" suppressHydrationWarning>
        <Loader name={settings.brand.name} slogan={BRAND.slogan} logoUrl={settings.brand.logoUrl} />
        <ScrollProgress />
        <AuthProvider>
          <SettingsProvider value={toPublicSettings(settings, saleCount)}>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main id="main" className="min-h-screen">
                {children}
              </main>
              <Footer />
              <CartDrawer />
              <CartToast />
              <WhatsAppButton />
              <BackToTop />
            </WishlistProvider>
          </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
