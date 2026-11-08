import React from "react";
import { LogoMark } from "@/components/ui/Logo";

/**
 * First-visit splash screen. It is plain markup + CSS animation (see
 * globals.css), so it disappears on its own and never blocks the page.
 * The inline script in layout.tsx adds `no-loader` on repeat visits.
 */
export default function Loader({ name, slogan, logoUrl }: { name: string; slogan: string; logoUrl?: string }) {
  const split = Math.ceil(name.length * 0.55);

  return (
    <div
      className="site-loader fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6 bg-brand-950"
      aria-hidden="true"
    >
      <div className="relative">
        <div className="hex-pattern absolute -inset-16 opacity-60" />
        <div className="relative h-24 w-24 overflow-hidden hex bg-brand-900">
          <div className="loader-fill absolute inset-0 bg-gold-500" />
          <LogoMark className="relative h-24 w-24" logoUrl={logoUrl} />
        </div>
      </div>
      <div className="text-center">
        <p className="font-display text-3xl font-extrabold tracking-tight text-white">
          {name.slice(0, split)}
          <span className="text-glow-400">{name.slice(split)}</span>
        </p>
        <p className="mt-1 text-xs font-medium text-white/60">{slogan}</p>
      </div>
    </div>
  );
}
