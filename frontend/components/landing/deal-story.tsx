"use client";

import { useState, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { Picto, PictoRow } from "@/components/ui/picto";

type Scene = { signs: ReactNode; title: string; text: string };

const coins = (blue: number, orange: number) => (
  <span role="img" aria-label={`${blue} coins inside your limit, ${orange} over it`} className="flex flex-wrap gap-0.5">
    {Array.from({ length: blue + orange }, (_, i) => (
      <Picto key={i} name="coin" tone={i < blue ? "assistant" : "waiting"} className="size-6" />
    ))}
  </span>
);

// One example deal from each side of the counter, told as signs on one baseline.
const stories: Record<"shopping" | "business", { tab: string; scenes: Scene[] }> = {
  shopping: {
    tab: "Shopping",
    scenes: [
      {
        signs: <PictoRow name="box" total={6} filled={6} tone="ink" size="size-6" label="6 hampers" className="max-w-28 gap-0.5" />,
        title: "You ask for 6 hampers",
        text: "Say what you need, your budget and when you need it by.",
      },
      {
        signs: <PictoRow name="shop" total={3} filled={3} tone="assistant" size="size-8" label="3 shops" />,
        title: "It asks 3 shops",
        text: "Your assistant finds shops that sell them and asks each one for a price.",
      },
      {
        signs: (
          <span className="flex items-end gap-1" role="img" aria-label="Price down from $474 to $417">
            <Picto name="tag" tone="ink" className="size-8" />
            <Picto name="tag" tone="assistant" className="size-6" />
          </span>
        ),
        title: "It gets $474 down to $417",
        text: "It asks for a better price, and never offers more than you allow.",
      },
      {
        signs: coins(5, 4),
        title: "It checks with you",
        text: "$417 is more than the $250 it may spend alone, so it asks first. Each coin is $50.",
      },
      {
        signs: <Picto name="box" tone="done" className="size-8" />,
        title: "You say yes, it's ordered",
        text: "It shows as paid once the payment has gone through.",
      },
    ],
  },
  business: {
    tab: "Business",
    scenes: [
      {
        signs: <PictoRow name="person" total={2} filled={2} tone="ink" size="size-8" label="2 customers" />,
        title: "Customers ask",
        text: "Shoppers' assistants and other businesses ask what you sell, and for how much.",
      },
      {
        signs: <Picto name="tag" tone="assistant" className="size-8" />,
        title: "It quotes your price",
        text: "Your assistant answers from your price list, day or night.",
      },
      {
        signs: (
          <span className="flex items-end gap-1" role="img" aria-label="A small discount">
            <Picto name="tag" tone="ink" className="size-8" />
            <Picto name="tag" tone="assistant" className="size-7" />
          </span>
        ),
        title: "It gives up to 10% off",
        text: "It can offer discounts, but only up to the limit you set.",
      },
      {
        signs: (
          <span className="flex items-end gap-1" role="img" aria-label="A bigger discount, waiting for you">
            <Picto name="tag" tone="ink" className="size-8" />
            <Picto name="tag" tone="waiting" className="size-6" />
          </span>
        ),
        title: "12% off? It asks you",
        text: "A bigger discount, or a large order for your stock, waits for your OK.",
      },
      {
        signs: <Picto name="box" tone="done" className="size-8" />,
        title: "Sold",
        text: "The sale is recorded, and you see when the payment has gone through.",
      },
    ],
  },
};

export function DealStory() {
  const [side, setSide] = useState<"shopping" | "business">("shopping");
  const story = stories[side];

  return (
    <div>
      <div role="tablist" aria-label="Whose side" className="inline-flex rounded-full bg-panel-raised p-1">
        {(Object.keys(stories) as (keyof typeof stories)[]).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            id={`story-tab-${key}`}
            aria-selected={side === key}
            aria-controls="story-panel"
            onClick={() => setSide(key)}
            className={cx(
              "h-10 rounded-full px-5 text-base font-medium transition-colors duration-150",
              side === key ? "bg-surface text-ink shadow-card" : "text-ink-2 hover:text-ink",
            )}
          >
            {stories[key].tab}
          </button>
        ))}
      </div>

      {/*
        One story on one baseline: every step's signs stand on the same line, captions hang below it.
        On phones the baseline turns into a vertical spine.
      */}
      <ol
        id="story-panel"
        role="tabpanel"
        aria-labelledby={`story-tab-${side}`}
        className="relative mt-10 grid gap-8 border-l-2 border-rule pl-6 lg:grid-cols-5 lg:gap-6 lg:border-l-0 lg:pl-0"
      >
        {story.scenes.map((s, i) => (
          <li
            key={`${side}-${s.title}`}
            className="relative animate-[land_260ms_var(--ease-signal)_both] lg:flex lg:flex-col"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex min-h-10 items-end lg:h-16 lg:border-b-2 lg:border-rule lg:pb-3">{s.signs}</div>
            <h3 className="mt-3 text-lg leading-snug font-bold text-ink">
              <span className="figure text-ink-3">{i + 1}.</span> {s.title}
            </h3>
            <p className="mt-1 text-base text-ink-2">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
