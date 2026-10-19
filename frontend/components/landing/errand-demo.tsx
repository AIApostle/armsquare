"use client";

import { useId, useState } from "react";
import { Check, CircleCheck } from "lucide-react";
import { cx, money, moneyWhole } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/mark";
import { Picto, PictoRow } from "@/components/ui/picto";

// An illustrative errand, labeled "Example" on the card.
const PRICE = 417.12;
const COIN = 50; // one coin stands for $50
const COINS = 16; // the slider runs to $800
const NEEDED = Math.ceil(PRICE / COIN);

/** The hero's proof: the coins you allow decide whether this offer is bought or waits for you. */
export function ErrandDemo() {
  const id = useId();
  const [coins, setCoins] = useState(5);
  const [approved, setApproved] = useState(false);
  const limit = coins * COIN;
  const bought = approved || limit >= PRICE;

  return (
    <div className="card overflow-hidden shadow-raised">
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <span className="inline-flex items-center gap-2 text-base font-medium text-ink">
          <span aria-hidden className="dot" data-tone="assistant" />
          Your shopping assistant
        </span>
        <Tag>Example</Tag>
      </div>
      <p className="px-6 pt-2 text-lg text-ink-2">&ldquo;6 gift hampers, under $480, by Thursday&rdquo;</p>

      {/* What it did, as pictures on one baseline */}
      <ol className="mx-6 mt-5 grid grid-cols-3 gap-3 rounded-[14px] bg-surface-sunk p-4">
        <Step caption="6 hampers wanted">
          <PictoRow name="box" total={6} filled={6} tone="ink" size="size-4.5" label="6 hampers" className="max-w-24 gap-0.5" />
        </Step>
        <Step caption="3 shops asked">
          <PictoRow name="shop" total={3} filled={3} tone="assistant" size="size-6" label="3 shops" />
        </Step>
        <Step caption="Haggled 12% off">
          <span className="flex items-center gap-1.5">
            <Picto name="tag" tone="assistant" className="size-6" />
            <span className="figure text-sm leading-tight">
              <s className="text-ink-3">$474</s>
              <br />
              <b className="text-ink">{money(PRICE)}</b>
            </span>
          </span>
        </Step>
      </ol>

      {/* The question, or the answer */}
      <div aria-live="polite" className="px-6 pt-5">
        {bought ? (
          <div className="animate-[land_260ms_var(--ease-signal)_both] rounded-[14px] bg-success-wash px-5 py-4">
            <p className="flex items-center gap-2 text-lg font-bold text-ink">
              <CircleCheck aria-hidden className="size-6 text-success" strokeWidth={2.25} />
              {approved ? "Bought, because you said yes" : "Bought for you"}
            </p>
            <p className="mt-1 text-base text-ink-2">
              {approved
                ? `6 hampers from Harbour Provisions for ${money(PRICE)}.`
                : `${money(PRICE)} is inside the ${moneyWhole(limit)} you let it spend on its own.`}
            </p>
          </div>
        ) : (
          <div className="animate-[land_260ms_var(--ease-signal)_both] rounded-[14px] border-2 border-live bg-primary-wash/60 px-5 py-4">
            <p className="text-lg font-bold text-ink">OK to buy for {money(PRICE)}?</p>
            <p className="mt-1 text-base text-ink-2">
              6 hampers from Harbour Provisions, arriving Thursday. That&apos;s more than the{" "}
              {moneyWhole(limit)} it may spend without asking, so it&apos;s checking with you.
            </p>
            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
              <Button variant="quiet">Not now</Button>
              <Button
                variant="primary"
                onClick={() => setApproved(true)}
                icon={<Check aria-hidden className="size-5" strokeWidth={2.5} />}
              >
                Yes, buy it
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* The rule you set, in coins */}
      <div className="mt-5 border-t border-rule px-6 pt-5 pb-6">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={id} className="text-base font-medium text-ink">
            Buy without asking me, up to
          </label>
          <output htmlFor={id} className="figure text-2xl font-bold text-info">
            {moneyWhole(limit)}
          </output>
        </div>
        <Coins allowed={coins} />
        <input
          id={id}
          type="range"
          className="limit-range mt-1"
          min={0}
          max={COINS}
          step={1}
          value={coins}
          aria-valuetext={moneyWhole(limit)}
          onChange={(e) => {
            setCoins(Number(e.target.value));
            setApproved(false);
          }}
          style={{ ["--fill" as string]: `${(coins / COINS) * 100}%` }}
        />
        <p className="mt-1 text-sm text-ink-3">
          Each coin is {moneyWhole(COIN)}. This offer needs {NEEDED} coins.
        </p>
      </div>
    </div>
  );
}

function Step({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col justify-end gap-2">
      <div className="flex min-h-12 items-end">{children}</div>
      <span className="text-sm leading-snug font-medium text-ink-2">{caption}</span>
    </li>
  );
}

/**
 * The coin row: blue coins are what it may spend alone; orange coins are the
 * part of this offer past that, which is why it asks; grey coins are unused.
 */
function Coins({ allowed }: { allowed: number }) {
  const label =
    allowed >= NEEDED
      ? `${allowed} of ${COINS} coins allowed; covers this offer`
      : `${allowed} of ${COINS} coins allowed; this offer needs ${NEEDED - allowed} more`;
  return (
    <span role="img" aria-label={label} className="mt-3 grid w-fit grid-cols-8 gap-1 sm:flex">
      {Array.from({ length: COINS }, (_, i) => {
        const tone = i < allowed ? "assistant" : i < NEEDED ? "waiting" : "empty";
        return (
          <Picto
            key={`${i}-${tone}`}
            name="coin"
            tone={tone}
            className={cx("size-[1.375rem] sm:size-6", tone !== "empty" && "animate-[picto-fill_200ms_var(--ease-signal)_both]")}
          />
        );
      })}
    </span>
  );
}
