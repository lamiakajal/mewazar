import React from "react";

const PALETTE = [
  ["#6b2a62", "#f5cb57"],
  ["#437c27", "#fdedbf"],
  ["#9a6208", "#fff8e6"],
  ["#4a1942", "#fadf8f"],
  ["#85357a", "#fdedbf"],
  ["#2c4e1f", "#f5cb57"],
];

/** Illustrated initials avatar. Colours are picked from the name, so each person keeps theirs. */
export default function Avatar({ name, className = "h-11 w-11" }: { name: string; className?: string }) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0])
    .join("");
  const hash = Array.from(name).reduce((sum, ch) => sum + (ch.codePointAt(0) ?? 0), 0);
  const [bg, fg] = PALETTE[hash % PALETTE.length];

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full text-sm font-extrabold ${className}`}
      style={{ background: bg, color: fg }}
      aria-hidden="true"
    >
      {letters || "?"}
    </span>
  );
}
