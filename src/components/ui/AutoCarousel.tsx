"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AutoCarouselProps {
  children: React.ReactNode;
  /** Time between automatic moves. */
  intervalMs?: number;
  /** Classes for the scrolling row (padding, gap). */
  className?: string;
  label: string;
}

/**
 * Row of cards that moves by itself, one card at a time, and starts again from
 * the beginning after the last card. It pauses while the visitor hovers, touches
 * or focuses it, stays swipeable and keyboard friendly, and stands still for
 * people who prefer reduced motion.
 */
export default function AutoCarousel({ children, intervalMs = 2500, className = "", label }: AutoCarouselProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = useCallback((direction: 1 | -1) => {
    const el = rowRef.current;
    const first = el?.firstElementChild as HTMLElement | null | undefined;
    if (!el || !first) return;

    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const width = first.offsetWidth + gap;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;

    if (direction === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (direction === -1 && atStart) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: direction * width, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (!paused.current) step(1);
    }, intervalMs);
    return () => {
      clearInterval(timer);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [intervalMs, step]);

  const pause = () => {
    paused.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };
  const resume = (delay = 0) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      paused.current = false;
    }, delay);
  };

  return (
    <div
      className="group/carousel relative"
      onMouseEnter={pause}
      onMouseLeave={() => resume()}
      onFocus={pause}
      onBlur={() => resume()}
      onTouchStart={pause}
      onTouchEnd={() => resume(4000)}
    >
      <div
        ref={rowRef}
        className={`carousel-scroll flex snap-x snap-mandatory gap-5 overflow-x-auto ${className}`}
        role="region"
        aria-label={label}
        aria-roledescription="carousel"
        tabIndex={0}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Previous"
        className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-stone-200 bg-surface/95 text-heading opacity-0 shadow-soft transition hover:bg-surface group-hover/carousel:opacity-100 focus-visible:opacity-100 md:grid cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Next"
        className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-stone-200 bg-surface/95 text-heading opacity-0 shadow-soft transition hover:bg-surface group-hover/carousel:opacity-100 focus-visible:opacity-100 md:grid cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
