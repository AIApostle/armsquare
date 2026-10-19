"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/lib/format";

const levels = [
  { name: "Just watches", does: "It keeps an eye on prices, stock and messages.", you: "You do everything yourself." },
  { name: "Suggests", does: "It suggests a price, a shop or a reply, and says why.", you: "You decide and act." },
  { name: "Gets it ready", does: "It prepares offers and orders, ready to send.", you: "You check them and press send." },
  { name: "Agrees, you confirm", does: "It talks to the other side and agrees a deal.", you: "Nothing happens until you say yes." },
  { name: "Buys within your limits", does: "It closes deals on its own, inside the limits you set.", you: "Anything over a limit comes to you." },
] as const;

/** How much the assistant does on its own: big tappable choices, the chosen one ringed. */
export function Ladder() {
  const [current, setCurrent] = useState(3);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const level = levels[current];

  // Radio-group keys: arrows move and select, Home/End jump; one Tab stop for the group.
  function onKeyDown(e: KeyboardEvent) {
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (current + 1) % levels.length
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (current - 1 + levels.length) % levels.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? levels.length - 1
              : null;
    if (next === null) return;
    e.preventDefault();
    setCurrent(next);
    buttons.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="How much it does on its own"
        onKeyDown={onKeyDown}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {levels.map((l, i) => {
          const on = i === current;
          return (
            <button
              key={l.name}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              onClick={() => setCurrent(i)}
              className={cx(
                "card flex min-h-28 flex-col justify-between p-4 text-left transition-[box-shadow,translate] duration-150",
                on ? "ring-3 ring-info" : "hover:-translate-y-0.5",
                i === levels.length - 1 && "col-span-2 sm:col-span-1",
              )}
            >
              {/* More filled dots, more it does alone */}
              <span aria-hidden className="flex gap-1">
                {levels.map((_, j) => (
                  <span key={j} className={cx("size-2.5 rounded-full", j <= i ? "bg-info" : "bg-picto-empty")} />
                ))}
              </span>
              <span className="mt-4 text-base leading-snug font-bold text-ink">{l.name}</span>
            </button>
          );
        })}
      </div>

      <div
        key={level.name}
        className="card mt-4 grid animate-[land_220ms_var(--ease-signal)_both] gap-4 p-6 sm:grid-cols-2"
        aria-live="polite"
      >
        <div>
          <p className="text-sm font-medium text-info">Your assistant</p>
          <p className="mt-1 text-lg text-ink">{level.does}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-ink-3">You</p>
          <p className="mt-1 text-lg text-ink">{level.you}</p>
        </div>
      </div>
      <p className="mt-4 text-base text-ink-3">
        New assistants start low. You can move them up as you get comfortable, or back down at any time.
      </p>
    </div>
  );
}
