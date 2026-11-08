import React from "react";
import HoneyDrip from "@/components/ui/HoneyDrip";


function Hex() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gold-500" aria-hidden="true">
      <path d="M12 1.5l9 5.25v10.5L12 22.5 3 17.25V6.75z" fill="currentColor" />
    </svg>
  );
}

function Row({
  items,
  reverse = false,
  large = false,
}: {
  items: string[];
  reverse?: boolean;
  large?: boolean;
}) {
  // The list is rendered twice so the -50% translate loops seamlessly.
  const track = [...items, ...items];
  return (
    <div className="flex overflow-hidden" aria-hidden="true">
      <div
        className={`flex min-w-max shrink-0 items-center gap-8 pr-8 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {track.map((item, i) => (
          <React.Fragment key={`${item}-${i}`}>
            <span
              className={
                large
                  ? "font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
                  : "text-sm font-semibold text-glow-100 sm:text-base"
              }
            >
              {item}
            </span>
            <Hex />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/** Two-row looping marquee band shown under the hero. */
export default function Marquee({
  words,
  notes,
  freeShippingFrom,
}: {
  words: string[];
  notes: string[];
  freeShippingFrom: string;
}) {
  const rowTwo = [`Free delivery over ${freeShippingFrom}`, ...notes];
  return (
    <section
      className="marquee-pause relative overflow-hidden bg-brand-900 py-8 sm:py-10"
      aria-label="Highlights"
    >
      <div className="hex-pattern absolute inset-0 opacity-50" aria-hidden="true" />
      <HoneyDrip />
      <div className="relative space-y-5 pt-4">
        <Row items={words} large />
        <Row items={rowTwo} reverse />
      </div>
      <p className="sr-only">
        Raw honey, mountain dry fruits, dates, saffron, ghee and tea with cash
        on delivery across Pakistan.
      </p>
    </section>
  );
}
