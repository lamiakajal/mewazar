import React from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { BRAND, whatsappLink } from "@/data/brand";
import { getSettings } from "@/lib/settings";

const SUPPORT_LINKS = [
  { name: "About us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Delivery policy", href: "/delivery-policy" },
  { name: "Return policy", href: "/return-policy" },
  { name: "FAQ", href: "/policy" },
  { name: "Track your order", href: "/track" },
  { name: "My orders", href: "/orders" },
];

export default async function Footer() {
  const { contact, social, categories: CATEGORIES, brand } = await getSettings();
  const socialLinks = (Object.entries(social) as [string, string][]).filter(([, url]) => !!url);

  return (
    <footer className="site-chrome relative overflow-hidden bg-brand-950 text-white/70">
      <div className="hex-pattern absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        {/* Call-to-action strip */}
        <div className="mb-14 flex flex-col items-start justify-between gap-6 rounded-3xl bg-linear-to-r from-gold-500 to-glow-400 p-7 text-gold-ink sm:flex-row sm:items-center sm:p-9">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Planning a gift or a bulk order?
            </h2>
            <p className="mt-1 max-w-xl text-sm font-medium text-gold-ink/80">
              Message us on WhatsApp for hampers, wedding favours and corporate
              orders with custom packaging.
            </p>
          </div>
          <a
            href={whatsappLink("Hello Mewazar, I have a bulk or gift order enquiry.", contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-brand-950 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-900"
          >
            Chat with us
          </a>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo inverted name={brand.name} tagline={brand.tagline} logoUrl={brand.logoUrl} />
            <p className="max-w-xs text-sm leading-relaxed">
              Raw honey, mountain dry fruits, dates, spices and pantry staples
              from the north of {BRAND.country}, packed in small batches and
              delivered to your door.
            </p>
            <p className="text-sm font-semibold text-glow-400">
              Cash on Delivery and direct bank transfer
            </p>
            {socialLinks.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1" aria-label="Social media">
                {socialLinks.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-bold capitalize text-white/80 transition hover:border-glow-400 hover:text-glow-300"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-4 font-display text-base font-bold text-white">Shop</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm lg:grid-cols-1">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/shop?cat=${cat.slug}`}
                    className="transition hover:text-glow-400"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-base font-bold text-white">Support</h3>
            <ul className="space-y-2.5 text-sm">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="transition hover:text-glow-400">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-base font-bold text-white">Get in touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-glow-400" />
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="transition hover:text-glow-400">
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-glow-400" />
                <a href={`mailto:${contact.supportEmail}`} className="break-all transition hover:text-glow-400">
                  {contact.supportEmail}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-glow-400" />
                <span>{contact.address || `Dispatching nationwide across ${BRAND.country}`}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-4">
            <Link href="/privacy-policy" className="transition hover:text-glow-400">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-glow-400">
              Terms
            </Link>
            <span>Secure checkout</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
