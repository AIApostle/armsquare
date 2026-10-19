import type { ReactNode } from "react";
import { cx } from "@/lib/format";

// Picture signs: solid, flat pictograms on one 24-unit grid. Each one stands
// for a real, countable thing (a coin, an item, a shop, a person), never decoration.

export type PictoName = "coin" | "box" | "shop" | "person" | "tag" | "bag";

const shapes: Record<PictoName, ReactNode> = {
  // A coin: a disc with a cut ring.
  coin: (
    <path
      fillRule="evenodd"
      d="M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18Zm0 2.6a6.4 6.4 0 1 0 0 12.8a6.4 6.4 0 1 0 0-12.8Zm0 1.1a5.3 5.3 0 1 1 0 10.6a5.3 5.3 0 1 1 0-10.6Z"
    />
  ),
  // One item: a parcel, drawn as a cube with gaps between its three faces.
  box: (
    <path d="M12 2.4 20.6 7 12 11.6 3.4 7 12 2.4ZM2.8 8.4l8.4 4.5V21.8l-8.4-4.6V8.4Zm18.4 0v8.8l-8.4 4.6v-8.9l8.4-4.5Z" />
  ),
  // A shop: striped awning over a door.
  shop: (
    <path
      fillRule="evenodd"
      d="M3.6 3h16.8l1.6 6H2L3.6 3ZM4 10.5h16V21h-6v-5.5h-4V21H4V10.5Z"
    />
  ),
  // A person.
  person: (
    <path d="M12 2.5a4 4 0 1 1 0 8a4 4 0 1 1 0-8ZM4 21v-2.5c0-3.6 3.6-6 8-6s8 2.4 8 6V21H4Z" />
  ),
  // A price tag with its string hole.
  tag: (
    <path
      fillRule="evenodd"
      d="M3 4.5A1.5 1.5 0 0 1 4.5 3h7.4l9.6 9.6-8.9 8.9L3 11.9V4.5Zm4.5 1.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3Z"
    />
  ),
  // A shopping bag.
  bag: (
    <path
      fillRule="evenodd"
      d="M8 7V6a4 4 0 0 1 8 0v1h3.2l-1 14H5.8l-1-14H8Zm2 0h4V6a2 2 0 0 0-4 0v1Z"
    />
  ),
};

export type PictoTone = "assistant" | "waiting" | "done" | "ink" | "empty";

const tones: Record<PictoTone, string> = {
  assistant: "text-info",
  waiting: "text-live",
  done: "text-success",
  ink: "text-ink",
  empty: "text-picto-empty",
};

/** One pictogram. Decorative unless given a label. */
export function Picto({
  name,
  tone = "ink",
  className,
  label,
}: {
  name: PictoName;
  tone?: PictoTone;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cx("size-6 shrink-0", tones[tone], className)}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {shapes[name]}
    </svg>
  );
}

/**
 * A counted row: `total` pictograms, the first `filled` in the tone's color and
 * the rest empty. The label says in words what the row counts.
 */
export function PictoRow({
  name,
  total,
  filled,
  tone = "assistant",
  label,
  size = "size-6",
  className,
  animate = false,
}: {
  name: PictoName;
  total: number;
  filled: number;
  tone?: Exclude<PictoTone, "empty">;
  label: string;
  size?: string;
  className?: string;
  /** Newly filled pictograms pop in. */
  animate?: boolean;
}) {
  return (
    <span role="img" aria-label={label} className={cx("inline-flex flex-wrap gap-1", className)}>
      {Array.from({ length: total }, (_, i) => {
        const on = i < filled;
        return (
          <Picto
            key={`${i}-${on}`}
            name={name}
            tone={on ? tone : "empty"}
            className={cx(size, on && animate && "animate-[picto-fill_220ms_var(--ease-signal)_both]")}
          />
        );
      })}
    </span>
  );
}

const UNITS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

/** A round value per sign that keeps a row to about `max` signs. */
export function signUnit(largest: number, max = 20) {
  return UNITS.find((u) => largest / u <= max) ?? UNITS[UNITS.length - 1];
}

/**
 * Money counted in coins, always with its key. Two readings:
 * - spent: blue coins are spent, grey coins are what's left of the limit;
 * - price: blue coins fit inside the limit, orange coins are the part over it.
 */
export function CoinRow({
  amount,
  limit,
  mode,
  unit,
  size = "size-5",
  className,
}: {
  amount: number;
  limit: number;
  mode: "spent" | "price";
  /** Dollars per coin; chosen from the larger figure when omitted. */
  unit?: number;
  size?: string;
  className?: string;
}) {
  const per = unit ?? signUnit(Math.max(amount, limit));
  const fmt = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const total = Math.ceil(Math.max(amount, limit) / per);
  const inside = Math.ceil(Math.min(amount, limit) / per);
  const over = mode === "price" ? Math.max(0, Math.ceil(amount / per) - inside) : 0;
  const label =
    mode === "spent"
      ? `${fmt(amount)} spent of ${fmt(limit)}, each coin ${fmt(per)}`
      : amount > limit
        ? `${fmt(amount)} is ${fmt(amount - limit)} over the ${fmt(limit)} limit, each coin ${fmt(per)}`
        : `${fmt(amount)} fits inside the ${fmt(limit)} limit, each coin ${fmt(per)}`;
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <span role="img" aria-label={label} className="flex flex-wrap gap-1">
        {Array.from({ length: total }, (_, i) => (
          <Picto
            key={i}
            name="coin"
            tone={i < inside ? "assistant" : i < inside + over ? "waiting" : "empty"}
            className={size}
          />
        ))}
      </span>
      <span className="text-sm text-ink-3">Each coin = {fmt(per)}</span>
    </div>
  );
}
